"use strict";
const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
      const file = fs.readFileSync(jsonPath, "utf8");
      /** @type {Array<any>} */
      const items = JSON.parse(file);
      const now = new Date();

      for (const item of items) {
        // Get product id by name
        const productRows = await queryInterface.sequelize.query(
          "SELECT id FROM products WHERE name = :name LIMIT 1",
          {
            replacements: { name: item.name },
            type: Sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );
        const productId =
          productRows && productRows[0] ? productRows[0].id : null;
        if (
          !productId ||
          !Array.isArray(item.features) ||
          !item.features.length
        )
          continue;

        // Get feature ids by title
        const featureTitles = item.features.map((f) => f.title);
        const featureRows = await queryInterface.sequelize.query(
          "SELECT id FROM features WHERE name IN (:names)",
          {
            replacements: { names: featureTitles },
            type: Sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );
        // Map features to junction rows
        const junctionRows = featureRows.map((row) => ({
          product_id: productId,
          feature_id: row.id,
          createdAt: now,
          updatedAt: now,
        }));
        if (junctionRows.length) {
          await queryInterface.bulkInsert("product_features", junctionRows, {
            transaction: t,
          });
        }
      }
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_features", null, {});
  },
};
