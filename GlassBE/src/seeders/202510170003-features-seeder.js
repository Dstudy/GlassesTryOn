"use strict";
const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
    const file = fs.readFileSync(jsonPath, "utf8");
    /** @type {Array<any>} */
    const items = JSON.parse(file);

    // Collect all features from products
    const featureMap = new Map();
    for (const item of items) {
      if (Array.isArray(item.features)) {
        for (const f of item.features) {
          const title = f.title;
          if (!featureMap.has(title)) {
            featureMap.set(title, {
              name: title,
              img: f.image || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }
    const featureRows = Array.from(featureMap.values());
    if (featureRows.length) {
      await queryInterface.bulkInsert("features", featureRows);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("features", null, {});
  },
};
