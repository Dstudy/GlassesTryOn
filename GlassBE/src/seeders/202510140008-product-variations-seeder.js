"use strict";
const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
    const raw = fs.readFileSync(jsonPath, "utf8");
    /** @type {Array<any>} */
    const products = JSON.parse(raw);

    const now = new Date();
    const slug = (s) =>
      String(s || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toUpperCase();

    for (const item of products) {
      if (!item.imagesByColor || typeof item.imagesByColor !== "object")
        continue;

      // Resolve product id by name
      const prodRows = await queryInterface.sequelize.query(
        "SELECT id FROM products WHERE name = :name LIMIT 1",
        { type: Sequelize.QueryTypes.SELECT, replacements: { name: item.name } }
      );
      if (!prodRows || !prodRows[0]) continue;
      const productId = prodRows[0].id;

      for (const [colorName] of Object.entries(item.imagesByColor)) {
        // Resolve or create color
        let colorRows = await queryInterface.sequelize.query(
          "SELECT id FROM colors WHERE name = :name LIMIT 1",
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { name: colorName },
          }
        );
        let colorId = colorRows && colorRows[0] ? colorRows[0].id : null;
        if (!colorId) {
          await queryInterface.bulkInsert(
            "colors",
            [{ name: colorName, hex_code: null }],
            {}
          );
          colorRows = await queryInterface.sequelize.query(
            "SELECT id FROM colors WHERE name = :name LIMIT 1",
            {
              type: Sequelize.QueryTypes.SELECT,
              replacements: { name: colorName },
            }
          );
          colorId = colorRows && colorRows[0] ? colorRows[0].id : null;
        }
        if (!colorId) continue;

        // Skip if variation already exists
        const existing = await queryInterface.sequelize.query(
          "SELECT id FROM product_variations WHERE product_id = :pid AND color_id = :cid LIMIT 1",
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { pid: productId, cid: colorId },
          }
        );
        if (existing && existing[0]) continue;

        await queryInterface.bulkInsert(
          "product_variations",
          [
            {
              product_id: productId,
              color_id: colorId,
              sku: `${slug(item.name)}-${slug(colorName)}`,
              stock_quantity: 100,
              createdAt: now,
              updatedAt: now,
            },
          ],
          {}
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_variations", null, {});
  },
};
