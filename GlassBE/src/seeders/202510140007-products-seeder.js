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

      // Helpers
      const now = new Date();
      const toPrice = (p) => {
        if (typeof p === "number") return p;
        if (!p) return 0;
        const m = String(p).match(/([0-9]+(?:\.[0-9]+)?)/);
        return m ? parseFloat(m[1]) : 0;
      };
      const normalizeMaterial = (m) => {
        if (!m) return null;
        const direct = m.trim();
        const comma = m.split(",")[0].trim();
        const dash = m.split("-")[0].trim();
        return direct || comma || dash;
      };
      const slug = (s) =>
        String(s || "")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .toUpperCase();

      // Lookup maps
      const [brands, shapes, materials, colors] = await Promise.all([
        queryInterface.sequelize.query("SELECT id, name FROM brands", {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }),
        queryInterface.sequelize.query("SELECT id, name FROM shapes", {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }),
        queryInterface.sequelize.query("SELECT id, name FROM materials", {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }),
        queryInterface.sequelize.query(
          "SELECT id, name, hex_code FROM colors",
          { type: Sequelize.QueryTypes.SELECT, transaction: t }
        ),
      ]);
      const brandIds = brands.map((b) => b.id);
      const shapeByName = new Map(shapes.map((s) => [s.name, s.id]));
      const materialByName = new Map(materials.map((m) => [m.name, m.id]));
      const colorByName = new Map(colors.map((c) => [c.name, c.id]));
      const brandByName = new Map(brands.map((b) => [b.name, b.id]));
      const randomFrom = (arr) =>
        arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

      // Parse size string like "Size Large ( 52 19 - 145 )" -> lens_width, bridge, length
      const parseDimensions = (sizeStr) => {
        if (!sizeStr || typeof sizeStr !== "string") return null;
        // match three numbers inside parentheses, allowing spaces and optional dash
        const m = sizeStr.match(/\(\s*([0-9]+)\s*([0-9]+)[\s-]+([0-9]+)\s*\)/);
        if (!m) return null;
        const lens_width = parseInt(m[1], 10);
        const bridge = parseInt(m[2], 10);
        const length = parseInt(m[3], 10);
        const width = lens_width * 2 + bridge; // approximate overall width
        const lens_height = Math.max(30, Math.round(lens_width * 0.75));
        return { lens_width, bridge, length, width, lens_height };
      };

      for (const item of items) {
        // Prefer JSON-provided values when available
        let shapeId = item.shape ? shapeByName.get(item.shape) || null : null;
        let materialKey = normalizeMaterial(item.material);
        let materialId = materialKey
          ? materialByName.get(materialKey) || null
          : null;
        // Fallbacks: random existing ids if missing
        if (!shapeId && shapes.length)
          shapeId = randomFrom(shapes.map((s) => s.id));
        if (!materialId && materials.length)
          materialId = randomFrom(materials.map((m) => m.id));
        // Brand: if JSON contains a brand name and it exists in DB, use it; otherwise pick random
        const brandName = item.brand || item.manufacturer || null;
        const brandId =
          brandName && brandByName.has(brandName)
            ? brandByName.get(brandName)
            : randomFrom(brandIds);

        // Insert product (MySQL bulkInsert returns undefined; no returning)
        await queryInterface.bulkInsert(
          "products",
          [
            {
              name: item.name,
              subtitle: item.subtitle || null,
              description:
                Array.isArray(item.descriptions) && item.descriptions[0]
                  ? item.descriptions[0].text
                  : null,
              brand_id: brandId || null,
              shape_id: shapeId,
              material_id: materialId,
              price: toPrice(item.price),
              size: item.size || null,
              // If size string contains numbers, parse real dimensions; otherwise fallback to random
              ...(() => {
                const dims = parseDimensions(item.size);
                if (dims) {
                  return {
                    length: dims.length,
                    width: dims.width,
                    lens_width: dims.lens_width,
                    lens_height: dims.lens_height,
                    bridge: dims.bridge,
                  };
                }
                return {
                  length: 135 + Math.floor(Math.random() * 16),
                  width: 120 + Math.floor(Math.random() * 21),
                  lens_width: 47 + Math.floor(Math.random() * 12),
                  lens_height: 38 + Math.floor(Math.random() * 13),
                  bridge: 16 + Math.floor(Math.random() * 7),
                };
              })(),
              isFeatured: false,
              active: true,
              createdAt: now,
              updatedAt: now,
            },
          ],
          { transaction: t }
        );

        // Retrieve inserted product id within the same transaction
        const row = await queryInterface.sequelize.query(
          "SELECT id FROM products ORDER BY id DESC LIMIT 1",
          { type: Sequelize.QueryTypes.SELECT, transaction: t }
        );
        const newProductId = row && row[0] ? row[0].id : null;

        if (!newProductId) continue;

        // Insert features
        if (Array.isArray(item.features) && item.features.length) {
          // Lookup feature ids by title
          const featureTitles = item.features.map((f) => f.title);
          const featureRows = await queryInterface.sequelize.query(
            `SELECT id FROM features WHERE name IN (:names)`,
            {
              replacements: { names: featureTitles },
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );
          // Map features to junction rows
          const junctionRows = featureRows.map((row, idx) => ({
            product_id: newProductId,
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

        // Insert variations and images by color
        if (item.imagesByColor && typeof item.imagesByColor === "object") {
          for (const [colorName, imageUrl] of Object.entries(
            item.imagesByColor
          )) {
            let colorId = colorByName.get(colorName) || null;
            if (!colorId) {
              // Create color if missing
              await queryInterface.bulkInsert(
                "colors",
                [{ name: colorName, hex_code: null }],
                { transaction: t }
              );
              const created = await queryInterface.sequelize.query(
                "SELECT id FROM colors WHERE name = :name LIMIT 1",
                {
                  type: Sequelize.QueryTypes.SELECT,
                  transaction: t,
                  replacements: { name: colorName },
                }
              );
              if (created && created[0]) {
                colorId = created[0].id;
                colorByName.set(colorName, colorId);
              }
            }

            // Create variation
            // Insert variation and include pic_url directly on the variation
            await queryInterface.bulkInsert(
              "product_variations",
              [
                {
                  product_id: newProductId,
                  color_id: colorId,
                  sku: `${slug(item.name)}-${slug(colorName)}`,
                  stock_quantity: 100,
                  pic_url: imageUrl,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
              { transaction: t }
            );
          }
        }
      }

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_images", null, {});
    await queryInterface.bulkDelete("product_variations", null, {});
    await queryInterface.bulkDelete("product_features", null, {});
    await queryInterface.bulkDelete("products", null, {});
  },
};
