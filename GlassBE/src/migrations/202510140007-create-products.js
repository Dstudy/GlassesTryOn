"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      subtitle: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      brand_id: {
        type: Sequelize.INTEGER,
        references: { model: "brands", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      shape_id: {
        type: Sequelize.INTEGER,
        references: { model: "shapes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      material_id: {
        type: Sequelize.INTEGER,
        references: { model: "materials", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      length: { type: Sequelize.FLOAT },
      width: { type: Sequelize.FLOAT },
      lens_width: { type: Sequelize.FLOAT },
      lens_height: { type: Sequelize.FLOAT },
      bridge: { type: Sequelize.FLOAT },
      isFeatured: { type: Sequelize.BOOLEAN, defaultValue: false },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      size: { type: Sequelize.STRING },
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      review_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("products");
  },
};
