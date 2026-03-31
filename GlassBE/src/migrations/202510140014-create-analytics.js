"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("analytics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      metric_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      metric_value: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      metric_type: {
        type: Sequelize.ENUM("revenue", "count", "percentage"),
        allowNull: false,
      },
      period: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g., "2024-01", "2024-Q1", "2024"',
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment:
          "Additional data like previous period values, growth rates, etc.",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("analytics", ["metric_name"]);
    await queryInterface.addIndex("analytics", ["metric_type"]);
    await queryInterface.addIndex("analytics", ["period"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("analytics");
  },
};
