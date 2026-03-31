"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("cart_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "carts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_variation_id: {
        type: Sequelize.INTEGER,
        references: { model: "product_variations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("cart_items");
  },
};
