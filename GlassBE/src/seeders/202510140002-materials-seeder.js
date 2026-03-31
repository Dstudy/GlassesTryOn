"use strict";
const fs = require("fs");
const path = require("path");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
    const raw = fs.readFileSync(jsonPath, "utf8");
    /** @type {Array<any>} */
    const products = JSON.parse(raw);

    const normalize = (m) => {
      if (!m) return null;
      const direct = m.trim();
      const comma = m.split(",")[0].trim();
      const dash = m.split("-")[0].trim();
      return direct || comma || dash;
    };

    const materialSet = new Set();
    for (const item of products) {
      const key = normalize(item.material);
      if (key) materialSet.add(key);
    }
    const rows = Array.from(materialSet).map((name) => ({ name }));
    if (rows.length) {
      await queryInterface.bulkInsert("materials", rows, {});
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("materials", null, {});
  },
};
