import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      fullname: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password_hash: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      role_id: DataTypes.INTEGER,
      reset_code: DataTypes.STRING,
      reset_code_expires: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { tableName: "users", timestamps: false }
  );
};
