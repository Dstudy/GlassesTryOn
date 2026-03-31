import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Cart",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: DataTypes.INTEGER,
    },
    { tableName: "carts", timestamps: false }
  );
