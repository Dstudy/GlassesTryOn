"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "glasses",
          description:
            "Various types of glasses including eyeglasses and sunglasses",
          image_url: null,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "necklaces",
          description: "Necklace jewelry pieces",
          image_url: null,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          name: "earrings",
          description: "Earring jewelry pieces",
          image_url: null,
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
