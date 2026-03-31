// shape.js
import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Shape",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: DataTypes.STRING,
    },
    { tableName: "shapes", timestamps: false }
  );
