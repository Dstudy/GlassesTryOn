"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();

    // Helper data for realistic reviews
    const goodReviews = [
      "Excellent product! Highly recommended.",
      "Just what I was looking for. Great quality.",
      "Love it! Fits perfectly and looks great.",
      "Very satisfied with this purchase.",
      "Five stars! Would buy again.",
    ];
    const badReviews = [
      "Not as described. Disappointed.",
      "Poor quality, broke after a week.",
      "Didn't fit well. Had to return it.",
      "Not worth the price. I expected more.",
    ];
    const randomFrom = (arr) =>
      arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

    try {
      // 1. Get all user IDs
      const users = await queryInterface.sequelize.query(
        "SELECT id FROM users",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const userIds = users.map((u) => u.id);

      // 2. Get all product IDs
      const products = await queryInterface.sequelize.query(
        "SELECT id FROM products",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const productIds = products.map((p) => p.id);

      if (!userIds.length || !productIds.length) {
        console.log("No users or products found. Skipping review seeding.");
        await t.commit();
        return;
      }

      const reviews = [];
      const usedPairs = new Set();
      const now = new Date();

      // Aim to create this many reviews, or the max possible, whichever is smaller
      const TOTAL_REVIEWS_TO_CREATE = 500;
      const maxPossibleReviews = userIds.length * productIds.length;
      const numToCreate = Math.min(TOTAL_REVIEWS_TO_CREATE, maxPossibleReviews);

      // 3. Generate reviews, respecting the unique (user_id, product_id) constraint
      while (reviews.length < numToCreate) {
        const userId = randomFrom(userIds);
        const productId = randomFrom(productIds);
        const key = `${userId}:${productId}`;

        // If this user has already reviewed this product, skip
        if (usedPairs.has(key)) {
          continue;
        }
        usedPairs.add(key);

        const rating = 1 + Math.floor(Math.random() * 5); // 1 to 5

        // 90% chance of having text, 10% chance of being null
        let review_text = null;
        if (Math.random() > 0.1) {
          review_text =
            rating > 3 ? randomFrom(goodReviews) : randomFrom(badReviews);
        }

        reviews.push({
          user_id: userId,
          product_id: productId,
          rating: rating,
          review_text: review_text,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 4. Bulk insert all generated reviews
      if (reviews.length > 0) {
        await queryInterface.bulkInsert("reviews", reviews, {
          transaction: t,
        });
      }

      // NEW: 5. Update product ratings and review counts
      // This query updates all products, joining against a subquery that
      // calculates the average rating and total count for each product.
      // COALESCE is used to set 0 for products that have no reviews.
      console.log("Updating product review counts and average ratings...");
      await queryInterface.sequelize.query(
        `
        UPDATE products p
        LEFT JOIN (
          SELECT
            product_id,
            COUNT(*) AS count,
            AVG(rating) AS avg_rating
          FROM reviews
          GROUP BY product_id
        ) AS r ON p.id = r.product_id
        SET
          p.review_count = COALESCE(r.count, 0),
          p.rating = COALESCE(r.avg_rating, 0);
      `,
        { transaction: t }
      );
      console.log("Product counts updated.");

      await t.commit();
    } catch (e) {
      await t.rollback();
      console.error("Failed to seed reviews:", e);
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    // NEW: Wrap down command in a transaction to ensure both operations succeed or fail
    const t = await queryInterface.sequelize.transaction();
    try {
      // This will remove ALL reviews from the table
      await queryInterface.bulkDelete("reviews", null, { transaction: t });

      // NEW: Reset product review counts and ratings back to 0
      await queryInterface.sequelize.query(
        "UPDATE products SET rating = 0, review_count = 0",
        { transaction: t }
      );

      await t.commit();
    } catch (e) {
      await t.rollback();
      console.error("Failed to rollback review seed:", e);
      throw e;
    }
  },
};
