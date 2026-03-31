"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "brands",
      [
        { id: 1, name: "Ray-Ban" },
        { id: 2, name: "Oakley" },
        { id: 3, name: "Gucci" },
        { id: 4, name: "Prada" },
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("brands", null, {});
  },
};
