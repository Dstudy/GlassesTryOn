import { Sequelize } from "sequelize";
import models, { sequelize } from "../models/index.js";

const { Analytics, Order, OrderItem, Product, ProductVariation, User } = models;

// Make sure you have these imports at the top of your file

export const getDashboardMetrics = async () => {
  try {
    // 1. Get current year for dynamic query
    const currentYear = new Date().getFullYear();

    // Get summary metrics from analytics table
    const summaryMetrics = await Analytics.findAll({
      where: {
        // 2. FIX: Use Op.is for NULL checks
        period: { [Sequelize.Op.is]: null },
        metric_name: [
          "total_revenue",
          "total_orders",
          "total_customers",
          "total_products",
        ],
      },
    });

    // Get monthly revenue data
    const monthlyRevenue = await Analytics.findAll({
      where: {
        metric_name: "monthly_revenue",
        period: {
          // 3. FIX: Use dynamic year instead of "2024-%"
          [Sequelize.Op.like]: `${currentYear}-%`,
        },
      },
      order: [["period", "ASC"]],
    });

    // Get top selling products (calculated from actual order data)
    const topProducts = await OrderItem.findAll({
      attributes: [
        [sequelize.col("ProductVariation.Product.id"), "product_id"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_sales"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("quantity * price_at_purchase")
          ),
          "total_revenue",
        ],
      ],
      include: [
        {
          model: ProductVariation,
          attributes: [],
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
      ],
      group: [
        sequelize.col("ProductVariation.Product.id"),
        sequelize.col("ProductVariation.Product.name"),
      ],
      // 4. FIX: Order by the correct alias "total_sales"
      order: [["total_sales", "DESC"]],
      limit: 5,
      raw: true,
      nest: true,
    });

    // Format the data to match dashboard requirements
    const formattedSummary = {};
    summaryMetrics.forEach((metric) => {
      const metadata =
        typeof metric.metadata === "string"
          ? JSON.parse(metric.metadata)
          : metric.metadata || {};
      formattedSummary[metric.metric_name] = {
        value: parseFloat(metric.metric_value),
        growth_rate: metadata.growth_rate || 0,
        previous_value: metadata.previous_period_value || 0,
      };
    });

    const formattedMonthlyRevenue = monthlyRevenue.map((metric) => {
      // 5. FIX (Good Practice): Use safer metadata parsing
      const metadata =
        typeof metric.metadata === "string"
          ? JSON.parse(metric.metadata)
          : metric.metadata || {};
      return {
        period: metric.period,
        month_name: metadata.month_name,
        revenue: parseFloat(metric.metric_value),
      };
    });

    const formattedTopProducts = topProducts.map((item, index) => ({
      rank: index + 1,
      product_name: item.ProductVariation?.Product?.name || "Unknown Product",
      // 6. FIX: Access properties directly, not via 'dataValues'
      sales: parseInt(item.total_sales),
      revenue: parseFloat(item.total_revenue),
    }));

    return {
      summary: formattedSummary,
      monthly_revenue: formattedMonthlyRevenue,
      top_products: formattedTopProducts,
    };
  } catch (error) {
    // Check your server console for this error!
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};

export const updateAnalytics = async () => {
  const t = await sequelize.transaction();
  try {
    // Calculate and update total revenue
    const totalRevenueResult = await OrderItem.findOne({
      attributes: [
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("quantity * price_at_purchase")
          ),
          "total_revenue",
        ],
      ],
      transaction: t,
    });

    const totalRevenue = parseFloat(
      totalRevenueResult?.dataValues?.total_revenue || 0
    );

    // Calculate and update total orders
    const totalOrders = await Order.count({ transaction: t });

    // Calculate and update total customers
    const totalCustomers = await User.count({
      where: { role_id: 2 }, // Assuming role_id 2 is for customers
      transaction: t,
    });

    // Calculate and update total products
    const totalProducts = await Product.count({ transaction: t });

    // Update or create analytics records
    await Analytics.upsert(
      {
        metric_name: "total_revenue",
        metric_value: totalRevenue,
        metric_type: "revenue",
        period: null,
        metadata: JSON.stringify({
          currency: "USD",
          last_updated: new Date().toISOString(),
        }),
      },
      { transaction: t }
    );

    await Analytics.upsert(
      {
        metric_name: "total_orders",
        metric_value: totalOrders,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          last_updated: new Date().toISOString(),
        }),
      },
      { transaction: t }
    );

    await Analytics.upsert(
      {
        metric_name: "total_customers",
        metric_value: totalCustomers,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          last_updated: new Date().toISOString(),
        }),
      },
      { transaction: t }
    );

    await Analytics.upsert(
      {
        metric_name: "total_products",
        metric_value: totalProducts,
        metric_type: "count",
        period: null,
        metadata: JSON.stringify({
          last_updated: new Date().toISOString(),
        }),
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true, message: "Analytics updated successfully" };
  } catch (error) {
    await t.rollback();
    console.error("Error updating analytics:", error);
    throw error;
  }
};

export const getMonthlyRevenue = async (year = 2024) => {
  try {
    const monthlyRevenue = await Analytics.findAll({
      where: {
        metric_name: "monthly_revenue",
        period: {
          [Sequelize.Op.like]: `${year}-%`,
        },
      },
      order: [["period", "ASC"]],
    });

    return monthlyRevenue.map((metric) => {
      const metadata = metric.metadata ? JSON.parse(metric.metadata) : {};
      return {
        period: metric.period,
        month_name: metadata.month_name,
        revenue: parseFloat(metric.metric_value),
      };
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    throw error;
  }
};

export const getTopSellingProducts = async (limit = 5) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        "product_variation_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_sales"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("quantity * price_at_purchase")
          ),
          "total_revenue",
        ],
      ],
      include: [
        {
          model: ProductVariation,
          include: [
            {
              model: Product,
              attributes: ["name", "id"],
            },
          ],
        },
      ],
      group: [
        "product_variation_id",
        "ProductVariation.id",
        "ProductVariation.Product.id",
      ],
      order: [[sequelize.literal("sales"), "DESC"]],
      limit: limit,
    });

    return topProducts.map((item, index) => ({
      rank: index + 1,
      product_id: item.ProductVariation?.Product?.id,
      product_name: item.ProductVariation?.Product?.name || "Unknown Product",
      sales: parseInt(item.dataValues.total_sales),
      revenue: parseFloat(item.dataValues.total_revenue),
    }));
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw error;
  }
};

export const getAnalyticsSummary = async (whereClause = {}) => {
  try {
    const analytics = await Analytics.findAll({
      where: whereClause,
      order: [["metric_name", "ASC"]],
    });

    return analytics.map((metric) => ({
      id: metric.id,
      metric_name: metric.metric_name,
      metric_value: parseFloat(metric.metric_value),
      metric_type: metric.metric_type,
      period: metric.period,
      metadata: metric.metadata ? JSON.parse(metric.metadata) : null,
      created_at: metric.created_at,
      updated_at: metric.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    throw error;
  }
};

export default {
  getDashboardMetrics,
  updateAnalytics,
  getMonthlyRevenue,
  getTopSellingProducts,
  getAnalyticsSummary,
};
