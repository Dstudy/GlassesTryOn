import models from "../models/index.js";
import { sequelize } from "../models/index.js";
import { Op } from "../models/index.js";

const {
  Product,
  ProductVariation,
  ProductImage,
  Brand,
  Shape,
  Color,
  Material,
  Feature,
  ProductFeature,
  Review,
  User,
} = models;

const getAllProducts = async (queryParams) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      shape,
      material,
      color,
      search,
      sortBy,
    } = queryParams;

    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;

    // === THAY ĐỔI: Xây dựng các tùy chọn truy vấn chung ===
    // Chúng ta sẽ sử dụng các tùy chọn này cho cả `count` và `findAll`
    const commonOptions = {
      where: { active: true },
      include: [
        { model: Brand, attributes: ["id", "name"] },
        { model: Shape, attributes: ["id", "name"] },
        { model: Material, attributes: ["id", "name"] },

        {
          model: ProductVariation,
          attributes: ["id"], // Chỉ cần ID để liên kết, không cần dữ liệu thừa
          required: false, // Sử dụng LEFT JOIN (quan trọng)
          include: [
            {
              model: ProductImage,
              attributes: ["pic_url"], // Chỉ lấy URL của ảnh
              limit: 1, // Chỉ lấy 1 ảnh (ảnh bìa)
              order: [["display_order", "ASC"]], // Lấy ảnh có thứ tự hiển thị đầu tiên
            },
            {
              model: Color,
              attributes: ["id", "name"],
              required: false, // Bắt đầu bằng LEFT JOIN
            },
          ],
        },
      ],
      distinct: true, // Cần thiết cho `count` khi có include
    };

    if (search) {
      commonOptions.where.name = sequelize.where(
        sequelize.fn("LOWER", sequelize.col("Product.name")),
        { [Op.like]: `%${search.toLowerCase()}%` }
      );
    }

    const applyFilter = (includeModel, filterValues) => {
      if (!filterValues || filterValues.length === 0) return;

      const include = commonOptions.include.find(
        (i) => i.model === includeModel
      );
      if (include) {
        include.where = {
          name: {
            [Op.in]: Array.isArray(filterValues)
              ? filterValues
              : [filterValues],
          },
        };
        include.required = true; // Chuyển thành INNER JOIN
      }
    };

    applyFilter(Brand, brand);
    applyFilter(Shape, shape);
    applyFilter(Material, material);

    if (color) {
      const variationInclude = commonOptions.include.find(
        (i) => i.model === ProductVariation
      );
      const colorInclude = variationInclude.include.find(
        (i) => i.model === Color
      );

      colorInclude.where = {
        name: {
          [Op.in]: Array.isArray(color) ? color : [color],
        },
      };
      colorInclude.required = true; // INNER JOIN Color
      variationInclude.required = true; // INNER JOIN ProductVariation
    }

    // 1. Đếm tổng số sản phẩm khớp với bộ lọc
    const count = await Product.count(commonOptions);

    // THAY ĐỔI: Xây dựng logic SẮP XẾP
    let order = [];
    if (sortBy === "price-asc") {
      // Sắp xếp theo 'price' của chính Product
      order.push(["price", "ASC"]);
    } else if (sortBy === "price-desc") {
      // Sắp xếp theo 'price' của chính Product
      order.push(["price", "DESC"]);
    } else if (sortBy === "rating") {
      order.push(["rating", "DESC"]); // Giả sử có cột này
    } else {
      order.push(["isFeatured", "DESC"]);
      order.push(["createdAt", "DESC"]);
    }

    // 2. Tìm các sản phẩm cho trang hiện tại
    const rows = await Product.findAll({
      ...commonOptions, // Sử dụng lại các tùy chọn (where, include, distinct)
      limit: numericLimit, // Thêm giới hạn
      offset: offset, // Thêm offset
      order: order,
      subQuery: true,
    });

    // === KẾT THÚC THAY ĐỔI ===

    return {
      totalProducts: count, // Sử dụng count từ truy vấn .count()
      totalPages: Math.ceil(count / numericLimit),
      currentPage: numericPage,
      products: rows, // Sử dụng rows từ truy vấn .findAll()
    };
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    throw new Error("Failed to get products.");
  }
};

const getAllBrands = async () => {
  const brands = await Brand.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return brands;
};

const getAllShapes = async () => {
  const shapes = await Shape.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return shapes;
};

const getAllColors = async () => {
  const colors = await Color.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return colors;
};

const getAllMaterials = async () => {
  const materials = await Material.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return materials;
};

const getAllFeatures = async () => {
  const features = await Feature.findAll({
    attributes: ["id", "name", "img"],
    order: [["name", "ASC"]],
  });
  return features;
};

const getProductFeatures = async (productId) => {
  const rows = await ProductFeature.findAll({
    where: { product_id: productId },
    include: [{ model: Feature, attributes: ["id", "name", "img"] }],
  });
  // return flattened feature objects
  return rows.map((r) => ({
    id: r.Feature.id,
    name: r.Feature.name,
    img: r.Feature.img,
  }));
};

const getFeature = async (id) => {
  if (!id) return null;
  const feat = await Feature.findByPk(id, {
    attributes: ["id", "name", "img"],
  });
  return feat;
};

const getProductById = async (id) => {
  // 1. Lấy thông tin sản phẩm chính (sử dụng cột 'averageRating' và 'totalReviews')
  const product = await Product.findOne({
    where: { id, active: true },
    include: [
      { model: Brand },
      { model: Shape },
      { model: Material },
      {
        model: ProductVariation,
        attributes: { exclude: ["price"] },
        include: [{ model: Color }, { model: ProductImage, limit: 1 }],
      },
    ],
  });

  if (!product) {
    return null;
  }

  // 2. Lấy 10 bài đánh giá mới nhất để hiển thị
  // (Chúng ta không cần tính toán AVG/COUNT nữa vì nó đã có trên 'product')
  const reviews = await Review.findAll({
    where: { product_id: id },
    include: [
      {
        model: User,
        attributes: ["id", "fullname"], // Chỉ lấy thông tin an toàn
      },
    ],
    order: [["createdAt", "ASC"]],
    limit: 10, // Giới hạn số lượng review trả về
  });

  // 3. Kết hợp dữ liệu
  return {
    ...product.toJSON(), // Chuyển product thành object
    reviews, // Gắn mảng reviews vào
    // 'averageRating' và 'totalReviews' đã có sẵn từ 'product.toJSON()'
  };
};

const getProductsByShape = async (shapeName, queryParams) => {
  const { page = 1, limit = 12 } = queryParams;
  const offset = (page - 1) * limit;

  const productsData = await Product.findAndCountAll({
    where: { active: true }, // Only show active products
    include: [
      {
        model: Shape,
        where: { name: shapeName },
        required: true, // Makes this an INNER JOIN
      },
      { model: Brand }, // Also include brand info
    ],
    limit: parseInt(limit, 10),
    offset: offset,
  });

  return {
    totalProducts: productsData.count,
    totalPages: Math.ceil(productsData.count / limit),
    currentPage: parseInt(page, 10),
    products: productsData.rows,
  };
};

const getProductsByColor = async (colorName, queryParams) => {
  const { page = 1, limit = 12 } = queryParams;
  const offset = (page - 1) * limit;

  // This query finds products that have at least one variant of the specified color.
  const productsData = await Product.findAndCountAll({
    where: { active: true }, // Only show active products
    include: [
      {
        model: ProductVariation,
        attributes: { exclude: ["price"] },
        required: true,
        include: [
          {
            model: Color,
            where: { name: colorName },
            required: true,
          },
        ],
      },
      { model: Brand }, // Also include brand info
    ],
    limit: parseInt(limit, 10),
    offset: offset,
    distinct: true,
  });

  return {
    totalProducts: productsData.count,
    totalPages: Math.ceil(productsData.count / limit),
    currentPage: parseInt(page, 10),
    products: productsData.rows,
  };
};

const getAllProductImages = async (productId) => {
  const images = await ProductImage.findAll({
    include: [
      {
        model: ProductVariation,
        attributes: [], // We only need it for the join
        where: { product_id: productId },
        required: true,
      },
    ],
    order: [["display_order", "ASC"]],
  });

  return images;
};

const getFeaturedProducts = async () => {
  try {
    const featuredProducts = await Product.findAll({
      where: { isFeatured: true, active: true }, // Only show active featured products
      limit: 8,
      include: [
        { model: Brand },
        { model: Shape },
        {
          model: ProductVariation,
          attributes: { exclude: ["price"] },
          include: [
            {
              model: ProductImage,
              limit: 1,
            },
            { model: Color },
          ],
        },
      ],
    });

    return { products: featuredProducts };
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    throw new Error("Failed to get featured products.");
  }
};

const getAllProductVariants = async (queryParams) => {
  try {
    const { page = 1, limit = 12, productId, color } = queryParams;

    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;

    const whereClause = {};
    if (productId) {
      whereClause.product_id = productId;
    }

    const includeClause = [
      {
        model: Product,
        where: { active: true }, // Only show variants of active products
        include: [{ model: Brand }, { model: Shape }, { model: Material }],
      },
      { model: ProductImage, limit: 1 },
    ];

    if (color) {
      includeClause.push({
        model: Color,
        where: { name: color },
        required: true,
      });
    } else {
      includeClause.push({ model: Color });
    }

    const { count, rows } = await ProductVariation.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["price"] },
      include: includeClause,
      limit: numericLimit,
      offset: offset,
      distinct: true,
    });

    return {
      totalVariants: count,
      totalPages: Math.ceil(count / numericLimit),
      currentPage: numericPage,
      variants: rows,
    };
  } catch (error) {
    console.error("Error in getAllProductVariants:", error);
    throw new Error("Failed to get product variants.");
  }
};

const _updateProductRating = async (productId, transaction) => {
  // 1. Tính toán AVG và COUNT
  const stats = await Review.findOne({
    where: { product_id: productId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
    ],
    transaction,
    raw: true, // Returns a plain object
  });

  const averageRating = stats.averageRating
    ? parseFloat(stats.averageRating)
    : 0;
  const totalReviews = stats.totalReviews
    ? parseInt(stats.totalReviews, 10)
    : 0;

  // 2. Cập nhật bảng Products
  await Product.update(
    { averageRating, totalReviews },
    { where: { id: productId }, transaction }
  );
};

const getProductReviews = async (productId, queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const numericLimit = parseInt(limit, 10);
  const numericPage = parseInt(page, 10);
  const offset = (numericPage - 1) * numericLimit;

  try {
    const { count, rows } = await Review.findAndCountAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          attributes: ["id", "fullname"],
        },
      ],
      limit: numericLimit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      totalReviews: count,
      totalPages: Math.ceil(count / numericLimit),
      currentPage: numericPage,
      reviews: rows,
    };
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    throw new Error("Failed to get product reviews.");
  }
};

const createReview = async (userId, productId, rating, reviewText) => {
  const t = await sequelize.transaction();
  console.log(
    "Creating review for user:",
    userId,
    "product:",
    productId,
    "reviewText:",
    reviewText
  );
  try {
    // 1. Create the review
    const newReview = await Review.create(
      {
        user_id: userId,
        product_id: productId,
        rating,
        review_text: reviewText,
      },
      { transaction: t }
    );

    // 2. Update the product's averageRating/totalReviews
    await _updateProductRating(productId, t);

    // 3. Commit
    await t.commit();
    return newReview;
  } catch (error) {
    await t.rollback();

    // Handle unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("You have already reviewed this product.");
    }
    console.error("Error in createReview:", error);
    throw new Error("Failed to create review.");
  }
};

const updateReview = async (reviewId, userId, newRating, newText) => {
  const t = await sequelize.transaction();
  try {
    // 1. Find the review and check ownership
    const review = await Review.findOne({
      where: { id: reviewId, user_id: userId },
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found or you do not have permission.");
    }

    // 2. Update the review
    review.rating = newRating;
    review.review_text = newText;
    await review.save({ transaction: t });

    // 3. Recalculate rating for the product
    await _updateProductRating(review.product_id, t);

    await t.commit();
    return review;
  } catch (error) {
    await t.rollback();
    console.error("Error in updateReview:", error);
    throw new Error("Failed to update review.");
  }
};

const deleteReview = async (reviewId, userId) => {
  const t = await sequelize.transaction();
  try {
    // 1. Find the review and check ownership
    const review = await Review.findOne({
      where: { id: reviewId, user_id: userId },
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found or you do not have permission.");
    }

    const { product_id } = review; // Get productId BEFORE deleting

    // 2. Delete the review
    await review.destroy({ transaction: t });

    // 3. Recalculate rating for the product
    await _updateProductRating(product_id, t);

    await t.commit();
    return { message: "Review deleted successfully." };
  } catch (error) {
    await t.rollback();
    console.error("Error in deleteReview:", error);
    throw new Error("Failed to delete review.");
  }
};

export default {
  getAllProducts,
  getProductById,
  getProductsByShape,
  getProductsByColor,
  getAllProductImages,
  getFeaturedProducts,
  getAllProductVariants,
  getAllBrands,
  getAllShapes,
  getAllColors,
  getAllMaterials,
  getAllFeatures,
  getProductFeatures,
  getFeature,

  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
