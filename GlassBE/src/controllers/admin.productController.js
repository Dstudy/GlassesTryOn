import productService from "../services/admin.productService.js";

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json({
      errCode: 0,
      message: "OK",
      products: products,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error getting products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        errCode: 1,
        message: "Product ID is required",
      });
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        errCode: 1,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "OK",
      product: product,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error getting product",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await productService.createProduct(productData);

    return res.status(201).json({
      errCode: 0,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error creating product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        errCode: 1,
        message: "Product ID is required",
      });
    }

    const updatedProduct = await productService.updateProduct(id, updateData);
    if (!updatedProduct) {
      return res.status(404).json({
        errCode: 1,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error updating product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        errCode: 1,
        message: "Product ID is required",
      });
    }

    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({
        errCode: 1,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

const getProductVariations = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        errCode: 1,
        message: "Product ID is required",
      });
    }

    const variations = await productService.getProductVariations(productId);

    return res.status(200).json({
      errCode: 0,
      message: "OK",
      variations: variations,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error getting product variations",
      error: error.message,
    });
  }
};

const setProductFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const features = req.body?.features || req.body;
    if (!id) {
      return res
        .status(400)
        .json({ errCode: 1, message: "Product ID is required" });
    }
    const updated = await productService.setProductFeatures(id, features);
    return res
      .status(200)
      .json({ errCode: 0, message: "OK", product: updated });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error setting features",
      error: error.message,
    });
  }
};

const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        errCode: 1,
        message: "Product ID is required",
      });
    }

    const updatedProduct = await productService.toggleProductActive(id);
    if (!updatedProduct) {
      return res.status(404).json({
        errCode: 1,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: `Product ${
        updatedProduct.active ? "activated" : "deactivated"
      } successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error toggling product active state",
      error: error.message,
    });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getProductVariations,
  setProductFeatures,
};
