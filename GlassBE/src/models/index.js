require("dotenv").config();
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import Product from "./product.js";
import ProductVariation from "./productVariation.js";
import ProductImage from "./productImage.js";
import ProductFeature from "./productFeature.js";
import Feature from "./feature.js";
import Brand from "./brand.js";
import Shape from "./shape.js";
import Material from "./material.js";
import Color from "./color.js";
import User from "./user.js";
import Role from "./role.js";
import Cart from "./cart.js";
import CartItem from "./cartItem.js";
import Order from "./order.js";
import OrderItem from "./orderItem.js";
import Favorite from "./favorite.js";
import Analytics from "./analytics.js";
import Reviews from "./review.js";
import Category from "./category.js";
// ✅ Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || "glasses",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    dialect: "mysql",
    logging: false,
    timezone: "+07:00",
  },
);

// ✅ Initialize models
// We store the initialized models in this 'models' object
const models = {
  Product: Product(sequelize),
  ProductVariation: ProductVariation(sequelize),
  ProductImage: ProductImage(sequelize),
  ProductFeature: ProductFeature(sequelize),
  Feature: Feature(sequelize),
  Brand: Brand(sequelize),
  Shape: Shape(sequelize),
  Material: Material(sequelize),
  Color: Color(sequelize),
  User: User(sequelize),
  Role: Role(sequelize),
  Cart: Cart(sequelize),
  CartItem: CartItem(sequelize),
  Order: Order(sequelize),
  OrderItem: OrderItem(sequelize),
  Favorite: Favorite(sequelize),
  Analytics: Analytics(sequelize),
  Review: Reviews(sequelize),
  Category: Category(sequelize),
};

// =================================================================
// ✅ Define Associations using the initialized models from the 'models' object
// =================================================================

// --- Product relationships ---
models.Brand.hasMany(models.Product, { foreignKey: "brand_id" });
models.Shape.hasMany(models.Product, { foreignKey: "shape_id" });
models.Material.hasMany(models.Product, { foreignKey: "material_id" });
models.Category.hasMany(models.Product, { foreignKey: "category_id" });

models.Product.belongsTo(models.Brand, { foreignKey: "brand_id" });
models.Product.belongsTo(models.Shape, { foreignKey: "shape_id" });
models.Product.belongsTo(models.Material, { foreignKey: "material_id" });
models.Product.belongsTo(models.Category, { foreignKey: "category_id" });
models.Product.hasMany(models.Review, { foreignKey: "product_id" });

//Product Reviews
models.Review.belongsTo(models.Product, { foreignKey: "product_id" });
models.Review.belongsTo(models.User, { foreignKey: "user_id" });

// Product features
models.Product.hasMany(models.ProductFeature, { foreignKey: "product_id" });
models.ProductFeature.belongsTo(models.Product, { foreignKey: "product_id" });
// Link ProductFeature <-> Feature
models.Feature.hasMany(models.ProductFeature, { foreignKey: "feature_id" });
models.ProductFeature.belongsTo(models.Feature, { foreignKey: "feature_id" });

models.Product.hasMany(models.ProductVariation, { foreignKey: "product_id" });
models.ProductVariation.belongsTo(models.Product, { foreignKey: "product_id" });

// --- Product Variations & Images ---
models.Color.hasMany(models.ProductVariation, { foreignKey: "color_id" });
models.ProductVariation.belongsTo(models.Color, { foreignKey: "color_id" });

models.ProductVariation.hasMany(models.ProductImage, {
  foreignKey: "product_variation_id",
});
models.ProductImage.belongsTo(models.ProductVariation, {
  foreignKey: "product_variation_id",
});

// --- Users & Roles ---
models.Role.hasMany(models.User, { foreignKey: "role_id" });
models.User.belongsTo(models.Role, { foreignKey: "role_id" });

// --- Carts & Items ---
models.User.hasOne(models.Cart, { foreignKey: "user_id" });
models.Cart.belongsTo(models.User, { foreignKey: "user_id" });

models.Cart.hasMany(models.CartItem, { foreignKey: "cart_id" });
models.CartItem.belongsTo(models.Cart, { foreignKey: "cart_id" });

models.ProductVariation.hasMany(models.CartItem, {
  foreignKey: "product_variation_id",
});
models.CartItem.belongsTo(models.ProductVariation, {
  foreignKey: "product_variation_id",
});

// --- Orders & Items ---
models.User.hasMany(models.Order, { foreignKey: "user_id" });
models.Order.belongsTo(models.User, { foreignKey: "user_id" });

models.Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
models.OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });

models.ProductVariation.hasMany(models.OrderItem, {
  foreignKey: "product_variation_id",
});
models.OrderItem.belongsTo(models.ProductVariation, {
  foreignKey: "product_variation_id",
});

// --- Favorites ---
models.User.hasMany(models.Favorite, { foreignKey: "user_id" });
models.Product.hasMany(models.Favorite, { foreignKey: "product_id" });
models.Favorite.belongsTo(models.User, { foreignKey: "user_id" });
models.Favorite.belongsTo(models.Product, { foreignKey: "product_id" });

// ✅ Export models + sequelize instance
export { sequelize };
export { Op };
export default models;
