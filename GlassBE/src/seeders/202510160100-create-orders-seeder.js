"use strict";
const { Op } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Determine target orders count from analytics if available
      const analytics = await queryInterface.sequelize.query(
        "SELECT metric_value FROM analytics WHERE metric_name = 'total_orders' LIMIT 1",
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );
      const target =
        analytics && analytics[0]
          ? parseInt(analytics[0].metric_value, 10)
          : 150;

      // Load available users and product variations
      const users = await queryInterface.sequelize.query(
        "SELECT id FROM users",
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );
      const variations = await queryInterface.sequelize.query(
        "SELECT id, product_id, color_id, pic_url FROM product_variations",
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      const userIds = users.map((u) => u.id);
      const randomFrom = (arr) =>
        arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

      const now = new Date();
      const orders = [];
      const orderItems = [];

      for (let i = 0; i < target; i++) {
        const userId = randomFrom(userIds) || null;
        const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items per order
        const selected = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const v = randomFrom(variations);
          if (!v) break;
          selected.push(v);
          // derive price from product table
        }

        // fetch prices for selected product_ids
        const productIds = [...new Set(selected.map((s) => s.product_id))];
        let prices = {};
        if (productIds.length) {
          const rows = await queryInterface.sequelize.query(
            `SELECT id, price FROM products WHERE id IN (:ids)`,
            {
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
              replacements: { ids: productIds },
            }
          );
          prices = rows.reduce(
            (acc, r) => ((acc[r.id] = parseFloat(r.price)), acc),
            {}
          );
        }

        const thisOrderIdPlaceholder = i + 1; // will be replaced after bulk insert

        selected.forEach((s) => {
          const price = prices[s.product_id] || 20.0;
          const qty = 1 + Math.floor(Math.random() * 2);
          subtotal += price * qty;
          orderItems.push({
            order_placeholder: thisOrderIdPlaceholder,
            product_variation_id: s.id,
            quantity: qty,
            price_at_purchase: price,
            createdAt: now,
            updatedAt: now,
          });
        });

        const shipping = subtotal > 50 ? 0 : 5.0;
        const total = Math.round((subtotal + shipping) * 100) / 100;

        orders.push({
          user_id: userId,
          province: "Province",
          district: "District",
          ward: "Ward",
          address: "123 Example St",
          order_date: now,
          delivery_date: null,
          status: "completed",
          note: null,
          subtotal: subtotal,
          shipping_cost: shipping,
          total_amount: total,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Insert orders in bulk and retrieve inserted ids
      await queryInterface.bulkInsert("orders", orders, { transaction: t });
      const inserted = await queryInterface.sequelize.query(
        "SELECT id FROM orders ORDER BY id DESC LIMIT :limit",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
          replacements: { limit: target },
        }
      );

      // inserted are in descending order; reverse to align with orders array
      const ids = inserted.map((r) => r.id).reverse();

      // Map placeholders to real ids and create final items
      const finalItems = orderItems
        .map((it) => {
          const realOrderId = ids[it.order_placeholder - 1] || null;
          return {
            order_id: realOrderId,
            product_variation_id: it.product_variation_id,
            quantity: it.quantity,
            price_at_purchase: it.price_at_purchase,
          };
        })
        .filter((i) => i.order_id);

      if (finalItems.length) {
        await queryInterface.bulkInsert("order_items", finalItems, {
          transaction: t,
        });
      }

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("order_items", null, {});
    await queryInterface.bulkDelete("orders", null, {});
  },
};
