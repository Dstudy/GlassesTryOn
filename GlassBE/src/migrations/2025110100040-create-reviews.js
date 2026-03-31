"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      rating: { type: Sequelize.SMALLINT, allowNull: false },
      review_text: { type: Sequelize.STRING, allowNull: true },

      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addConstraint("reviews", {
      fields: ["user_id", "product_id"],
      type: "unique",
      name: "favorites_user_product_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reviews");
  },
};
