import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: DataTypes.INTEGER,
      province: DataTypes.STRING,
      district: DataTypes.STRING,
      ward: DataTypes.STRING,
      address: DataTypes.STRING,
      order_date: DataTypes.DATE,
      delivery_date: DataTypes.DATEONLY,
      status: DataTypes.STRING,
      note: DataTypes.TEXT,
      subtotal: DataTypes.DECIMAL(10, 2),
      shipping_cost: DataTypes.DECIMAL(10, 2),
      total_amount: DataTypes.DECIMAL(10, 2),
    },
    { tableName: "orders", timestamps: true }
  );
