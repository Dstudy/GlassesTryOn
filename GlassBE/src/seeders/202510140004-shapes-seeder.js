"use strict";
const fs = require("fs");
const path = require("path");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
    const raw = fs.readFileSync(jsonPath, "utf8");
    /** @type {Array<any>} */
    const products = JSON.parse(raw);

    const shapeSet = new Set();
    for (const item of products) {
      if (item.shape) shapeSet.add(item.shape);
    }
    const rows = Array.from(shapeSet).map((name) => ({ name }));
    if (rows.length) {
      await queryInterface.bulkInsert("shapes", rows, {});
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("shapes", null, {});
  },
};
