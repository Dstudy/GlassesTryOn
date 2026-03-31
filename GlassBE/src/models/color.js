// color.js
import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Color",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: DataTypes.STRING,
      hex_code: DataTypes.STRING,
    },
    { tableName: "colors", timestamps: false }
  );
