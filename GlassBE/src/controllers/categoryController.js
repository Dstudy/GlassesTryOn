import categoryService from "../services/categoryService.js";

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      errCode: 0,
      message: "OK",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error getting categories",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        errCode: 1,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "OK",
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error getting category details",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const newCategory = await categoryService.createCategory(categoryData);

    return res.status(201).json({
      errCode: 0,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error creating category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedCategory = await categoryService.updateCategory(
      id,
      updateData,
    );

    if (!updatedCategory) {
      return res.status(404).json({
        errCode: 1,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error updating category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await categoryService.deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({
        errCode: 1,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      errCode: 0,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
