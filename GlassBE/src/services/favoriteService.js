import models from "../models/index.js";

const {
  Favorite,
  Product,
  Brand,
  Shape,
  Material,
  ProductVariation,
  ProductImage,
  Color,
} = models;

export const addFavorite = async (userId, productId) => {
  const [fav] = await Favorite.findOrCreate({
    where: { user_id: userId, product_id: productId },
    defaults: { user_id: userId, product_id: productId },
  });
  return fav;
};

export const removeFavorite = async (userId, productId) => {
  const deleted = await Favorite.destroy({
    where: { user_id: userId, product_id: productId },
  });
  return deleted > 0;
};

export const listFavorites = async (userId) => {
  const favorites = await Favorite.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Product,
        include: [
          { model: Brand, attributes: ["id", "name"] },
          { model: Shape, attributes: ["id", "name"] },
          { model: Material, attributes: ["id", "name"] },
          {
            model: ProductVariation,
            attributes: { exclude: ["price"] },
            include: [{ model: ProductImage, limit: 1 }, { model: Color }],
            limit: 1,
          },
        ],
      },
    ],
  });
  return favorites;
};

export default { addFavorite, removeFavorite, listFavorites };
