import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductImage",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      product_variation_id: DataTypes.INTEGER,
      pic_url: DataTypes.STRING,
      display_order: DataTypes.INTEGER,
    },
    { tableName: "product_images", timestamps: false }
  );
};
