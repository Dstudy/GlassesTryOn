// brand.js
import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Brand",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: DataTypes.STRING,
    },
    { tableName: "brands", timestamps: false }
  );
