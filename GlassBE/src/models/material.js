// material.js
import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Material",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: DataTypes.STRING,
    },
    { tableName: "materials", timestamps: false }
  );
