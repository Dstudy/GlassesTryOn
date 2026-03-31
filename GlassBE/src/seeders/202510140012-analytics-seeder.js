"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const analyticsData = [
      // Dashboard summary metrics
      {
        metric_name: "total_revenue",
        metric_value: 125430.0,
        metric_type: "revenue",
        period: null,
        metadata: JSON.stringify({
          previous_period_value: 108900.0,
          growth_rate: 15.2,
          currency: "USD",
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "total_orders",
        metric_value: 156,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          previous_period_value: 144,
          growth_rate: 8.5,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "total_customers",
        metric_value: 89,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          previous_period_value: 79,
          growth_rate: 12.3,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "total_products",
        metric_value: 24,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          active_products: 24,
          inactive_products: 0,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Monthly revenue data
      {
        metric_name: "monthly_revenue_2024-01",
        metric_value: 8500.0,
        metric_type: "revenue",
        period: "2024-01",
        metadata: JSON.stringify({
          month_name: "January",
          year: 2024,
          month: 1,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "monthly_revenue_2024-02",
        metric_value: 9200.0,
        metric_type: "revenue",
        period: "2024-02",
        metadata: JSON.stringify({
          month_name: "February",
          year: 2024,
          month: 2,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "monthly_revenue_2024-03",
        metric_value: 10800.0,
        metric_type: "revenue",
        period: "2024-03",
        metadata: JSON.stringify({
          month_name: "March",
          year: 2024,
          month: 3,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "monthly_revenue_2024-04",
        metric_value: 12500.0,
        metric_type: "revenue",
        period: "2024-04",
        metadata: JSON.stringify({
          month_name: "April",
          year: 2024,
          month: 4,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "monthly_revenue_2024-05",
        metric_value: 14200.0,
        metric_type: "revenue",
        period: "2024-05",
        metadata: JSON.stringify({
          month_name: "May",
          year: 2024,
          month: 5,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        metric_name: "monthly_revenue_2024-06",
        metric_value: 15800.0,
        metric_type: "revenue",
        period: "2024-06",
        metadata: JSON.stringify({
          month_name: "June",
          year: 2024,
          month: 6,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("analytics", analyticsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("analytics", null, {});
  },
};
