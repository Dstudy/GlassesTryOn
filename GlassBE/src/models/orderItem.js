import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "OrderItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: DataTypes.INTEGER,
      product_variation_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price_at_purchase: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "order_items", timestamps: false }
  );
