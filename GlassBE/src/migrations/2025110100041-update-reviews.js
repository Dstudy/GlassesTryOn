// db/migrations/YYYYMMDDHHMMSS-add-rating-columns-to-products.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "averageRating", {
      type: Sequelize.DECIMAL(3, 2), // e.g., 4.50
      allowNull: false,
      defaultValue: 0.0,
    });
    await queryInterface.addColumn("products", "totalReviews", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("products", "averageRating");
    await queryInterface.removeColumn("products", "totalReviews");
  },
};
