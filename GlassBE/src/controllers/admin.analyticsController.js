import * as analyticsService from "../services/admin.analyticsService.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
      message: "Dashboard metrics retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getDashboardMetrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard metrics",
      error: error.message,
    });
  }
};

export const updateAnalytics = async (req, res) => {
  try {
    const result = await analyticsService.updateAnalytics();

    res.status(200).json({
      success: true,
      data: result,
      message: "Analytics updated successfully",
    });
  } catch (error) {
    console.error("Error in updateAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update analytics",
      error: error.message,
    });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const monthlyRevenue = await analyticsService.getMonthlyRevenue(year);

    res.status(200).json({
      success: true,
      data: monthlyRevenue,
      message: "Monthly revenue data retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getMonthlyRevenue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve monthly revenue data",
      error: error.message,
    });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    const topProducts = await analyticsService.getTopSellingProducts(limit);

    res.status(200).json({
      success: true,
      data: topProducts,
      message: "Top selling products retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getTopSellingProducts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve top selling products",
      error: error.message,
    });
  }
};

export const getAnalyticsSummary = async (req, res) => {
  try {
    const { metric_type, period } = req.query;

    // Build where clause based on query parameters
    const whereClause = {};
    if (metric_type) {
      whereClause.metric_type = metric_type;
    }
    if (period) {
      whereClause.period = period;
    }

    const analytics = await analyticsService.getAnalyticsSummary(whereClause);

    res.status(200).json({
      success: true,
      data: analytics,
      message: "Analytics summary retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getAnalyticsSummary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics summary",
      error: error.message,
    });
  }
};

export default {
  getDashboardMetrics,
  updateAnalytics,
  getMonthlyRevenue,
  getTopSellingProducts,
  getAnalyticsSummary,
};
