import models from "../models/index.js";

const { Category } = models;

const getAllCategories = async () => {
  return await Category.findAll({
    where: { active: true },
    order: [["name", "ASC"]],
  });
};

const getCategoryById = async (id) => {
  return await Category.findOne({
    where: { id, active: true },
  });
};

const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

const updateCategory = async (id, updateData) => {
  const [affectedRows] = await Category.update(updateData, {
    where: { id },
  });

  if (affectedRows === 0) {
    return null;
  }

  return await Category.findByPk(id);
};

const deleteCategory = async (id) => {
  const affectedRows = await Category.destroy({
    where: { id },
  });

  return affectedRows > 0;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
