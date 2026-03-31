import { DataTypes } from "sequelize";
export default (sequelize) =>
  sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: DataTypes.STRING,
    },
    { tableName: "roles", timestamps: false }
  );
