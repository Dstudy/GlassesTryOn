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
    for (const item of products) {
      if (!item.imagesByColor || typeof item.imagesByColor !== "object")
        continue;
      // Find product id by name
      const prodRows = await queryInterface.sequelize.query(
        "SELECT id FROM products WHERE name = :name LIMIT 1",
        { type: Sequelize.QueryTypes.SELECT, replacements: { name: item.name } }
      );
      if (!prodRows || !prodRows[0]) continue;
      const productId = prodRows[0].id;

      for (const [colorName, imageUrl] of Object.entries(item.imagesByColor)) {
        // Resolve color id
        const colorRows = await queryInterface.sequelize.query(
          "SELECT id FROM colors WHERE name = :name LIMIT 1",
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { name: colorName },
          }
        );
        if (!colorRows || !colorRows[0]) continue;
        const colorId = colorRows[0].id;

        // Find matching variation
        const varRows = await queryInterface.sequelize.query(
          "SELECT id FROM product_variations WHERE product_id = :pid AND color_id = :cid ORDER BY id DESC LIMIT 1",
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { pid: productId, cid: colorId },
          }
        );
        if (!varRows || !varRows[0]) continue;
        const variationId = varRows[0].id;

        // Insert product image if not exists for this variation & url
        const existing = await queryInterface.sequelize.query(
          "SELECT id FROM product_images WHERE product_variation_id = :vid AND pic_url = :url LIMIT 1",
          {
            type: Sequelize.QueryTypes.SELECT,
            replacements: { vid: variationId, url: imageUrl },
          }
        );
        if (!existing || !existing[0]) {
          await queryInterface.bulkInsert(
            "product_images",
            [
              {
                product_variation_id: variationId,
                pic_url: imageUrl,
                display_order: 1,
              },
            ],
            {}
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_images", null, {});
  },
};
