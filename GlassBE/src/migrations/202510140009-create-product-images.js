"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_images", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_variation_id: {
        type: Sequelize.INTEGER,
        references: { model: "product_variations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      pic_url: { type: Sequelize.STRING },
      display_order: { type: Sequelize.INTEGER },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("product_images");
  },
};
