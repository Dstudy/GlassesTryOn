"use strict";
const fs = require("fs");
const path = require("path");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const jsonPath = path.join(__dirname, "..", "..", "ref", "products.json");
    const raw = fs.readFileSync(jsonPath, "utf8");
    /** @type {Array<any>} */
    const products = JSON.parse(raw);

    const colorSet = new Set();
    for (const item of products) {
      if (!item.imagesByColor) continue;
      for (const colorName of Object.keys(item.imagesByColor)) {
        colorSet.add(colorName);
      }
    }

    // A small mapping of common color names to hex codes. Extend as needed.
    const colorNameToHex = {
      golden: "#D4AF37",
      black: "#000000",
      "rose gold": "#B76E79",
      silver: "#C0C0C0",
      gunmetal: "#2C3539",
      "frost blue": "#0000FF",
      bronze: "#CD7F32",
      "starlight yellow": "#FFFF00",
      "matte black": "#000000",
      "clear light brown": "#A52A2A",
      tortoise: "#8B6D5C",
      clear: "#FFFFFF",
      "clear yellow": "#FFFF00",
      "clear mint": "#98FFB0",
      orange: "#FFA500",
      "ivory tortoise": "#E9D6C3",
      "clear green": "#008000",
      burgundy: "#800020",
      blue: "#0000FF",
      "clear purple": "#800080",
      "black & silver": "#000000",
      white: "#FFFFFF",
      "gray floral": "#808080",
      navy: "#000080",
      "green tortoise": "#008000",
      gray: "#808080",
      "blood orange": "#FFA500",
      "pink ivory tortoise": "#FFC0CB",
      "clear melon": "#FFAD60",
      coral: "#FF7F50",
      red: "#FF0000",
      "tortoise green": "#008000",
      "ivory & tortoise": "#DCC7A1",
      "clear blue": "#0000FF",
      "gray & floral": "#808080",
      "clear copper": "#B87333",
      "black floral": "#000000",
      "matte clear": "#F5F5F5",
      "clear pink": "#FFC0CB",
      raspberry: "#E30B5D",
      pink: "#FFC0CB",
      "emerald green": "#008000",
      purple: "#800080",
      "blue floral": "#0000FF",
      "gray clear": "#808080",
      "warm tortoise": "#A67B5B",
      "clear brown": "#A52A2A",
      "black golden": "#000000",
      "black silver": "#000000",
      translucent: "#EFEFEF",
      cognac: "#8B5A2B",
      "striped granite": "#6E7B8B",
      gold: "#D4AF37",
      floral: "#FFB6C1",
      "matte black & golden": "#000000",
      "navy blue & tortoise": "#0000FF",
      "matte gold tortoise": "#CBA135",
      "matte silver tortoise": "#B7B7B7",
      "coral & tortoise": "#E07A5F",
    };

    const normalize = (s) => (s || "").toString().trim().toLowerCase();

    const rows = Array.from(colorSet).map((name) => {
      const n = normalize(name);
      // Try exact match
      let hex = colorNameToHex[n] || null;
      // Try partial/token match (e.g., 'dark green', 'light blue')
      if (!hex) {
        for (const key of Object.keys(colorNameToHex)) {
          if (n.includes(key)) {
            hex = colorNameToHex[key];
            break;
          }
        }
      }
      return { name, hex_code: hex };
    });
    if (rows.length) {
      await queryInterface.bulkInsert("colors", rows, {});
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("colors", null, {});
  },
};
