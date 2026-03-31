import express from "express";
import getHomePage from "../controllers/homeController.js";
import userController from "../controllers/userController.js";
import adminProductController from "../controllers/admin.productController.js";
import adminOrderController from "../controllers/admin.orderController.js";
import adminAnalyticsController from "../controllers/admin.analyticsController.js";
import productController from "../controllers/productController.js";
import adminProductImageController from "../controllers/admin.productImageController.js";
import favoriteController from "../controllers/favoriteController.js";
import cartController from "../controllers/cartController.js";
import orderController from "../controllers/orderController.js";

const router = express.Router();

const initWebRoutes = (app) => {
  router.get("/", getHomePage);
  router.get("/about", getHomePage);

  // User routes
  router.post("/api/login", userController.handleLogin);
  router.post("/api/register", userController.hanbleUserRegister);
  router.get("/api/user/:id", userController.getUserById);
  router.get("/api/get-all-users", userController.getAllUsers);
  router.put("/api/update-user", userController.updateUser);
  router.put("/api/update-user-password", userController.updateUserPassword);
  router.post("/api/forgot-password", userController.handleForgotPassword);
  router.post("/api/verify-code", userController.handleVerifyCode);
  router.post("/api/reset-password", userController.handleResetPassword);

  // Admin Product routes
  router.get("/api/admin/products", adminProductController.getAllProducts);
  router.get("/api/admin/products/:id", adminProductController.getProductById);
  router.post("/api/admin/products", adminProductController.createProduct);
  router.put("/api/admin/products/:id", adminProductController.updateProduct);
  router.delete(
    "/api/admin/products/:id",
    adminProductController.deleteProduct
  );
  router.get(
    "/api/admin/products/:productId/variations",
    adminProductController.getProductVariations
  );
  router.put(
    "/api/admin/products/:id/features",
    adminProductController.setProductFeatures
  );
  router.patch(
    "/api/admin/products/:id/toggle-active",
    adminProductController.toggleProductActive
  );

  // Product image management (admin)
  router.post(
    "/api/admin/product-variations/:variationId/images",
    adminProductImageController.addImage
  );
  router.put(
    "/api/admin/product-images/:id",
    adminProductImageController.updateImage
  );
  router.delete(
    "/api/admin/product-images/:id",
    adminProductImageController.deleteImage
  );

  // Admin Orders
  router.get("/api/admin/orders", adminOrderController.getAllOrders);
  router.get("/api/admin/orders/:id", adminOrderController.getOrderById);
  router.post("/api/admin/orders", adminOrderController.createOrder);
  router.put("/api/admin/orders/:id/status", adminOrderController.updateStatus);
  router.delete("/api/admin/orders/:id", adminOrderController.cancelOrder);

  // Admin Analytics
  router.get(
    "/api/admin/analytics/dashboard",
    adminAnalyticsController.getDashboardMetrics
  );
  router.get(
    "/api/admin/analytics/monthly-revenue",
    adminAnalyticsController.getMonthlyRevenue
  );
  router.get(
    "/api/admin/analytics/top-products",
    adminAnalyticsController.getTopSellingProducts
  );
  router.get(
    "/api/admin/analytics/summary",
    adminAnalyticsController.getAnalyticsSummary
  );
  router.post(
    "/api/admin/analytics/update",
    adminAnalyticsController.updateAnalytics
  );

  //User Product routes
  router.get("/api/products", productController.getAllProducts);
  router.get("/api/products/:id", productController.getProductById);
  router.get("/api/products/featured", productController.getFeaturedProducts);
  // Avoid collision with /api/products/:id by making shape a sub-path
  router.get(
    "/api/products/shape/:shapeName",
    productController.getProductsByShape
  );
  router.get(
    "/api/products/color/:colorName",
    productController.getProductsByColor
  );
  router.get(
    "/api/products/:productId/images",
    productController.getAllProductImages
  );
  router.get(
    "/api/products/:productId/variants",
    productController.getAllProductVariants
  );

  //reviews
  router.get(
    "/api/products/:productId/reviews",
    productController.getProductReviews
  );
  router.post(
    "/api/products/:productId/reviews",
    productController.createProductReview
  );
  router.put(
    "/api/products/:productId/reviews/:reviewId",
    productController.updateProductReview
  );
  router.delete(
    "/api/products/:productId/reviews/:reviewId",
    productController.deleteProductReview
  );

  // Features
  router.get("/api/features", productController.getAllFeatures);
  router.get(
    "/api/products/:productId/features",
    productController.getProductFeatures
  );
  router.get("/api/features/:id", productController.getFeature);

  // Favorites
  router.get("/api/users/:userId/favorites", favoriteController.list);
  router.post("/api/favorites", favoriteController.add);
  router.delete(
    "/api/users/:userId/favorites/:productId",
    favoriteController.remove
  );

  // Cart
  router.get("/api/users/:userId/cart", cartController.getCart);
  router.post("/api/users/:userId/cart/items", cartController.addItem);
  router.put("/api/users/:userId/cart/items", cartController.updateItem);
  router.delete(
    "/api/users/:userId/cart/items/:productVariationId",
    cartController.removeItem
  );
  router.delete("/api/users/:userId/cart", cartController.clearCart);

  // Orders
  router.get("/api/users/:userId/orders", orderController.list);
  router.get("/api/users/:userId/orders/:orderId", orderController.detail);
  router.post("/api/users/:userId/orders", orderController.createFromCart);
  router.delete("/api/users/:userId/orders/:orderId", orderController.cancel);

  // Lookup routes for FE to resolve ids to names
  router.get("/api/brands", productController.getAllBrands);
  router.get("/api/shapes", productController.getAllShapes);
  router.get("/api/colors", productController.getAllColors);
  router.get("/api/materials", productController.getAllMaterials);

  return app.use("/", router);
};

export default initWebRoutes;
