import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductVariation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: DataTypes.INTEGER,
      color_id: DataTypes.INTEGER,
      pic_url: DataTypes.STRING,
      sku: DataTypes.STRING,
      stock_quantity: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { tableName: "product_variations", timestamps: false }
  );
  ProductVariation.associate = (models) => {
    ProductVariation.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "Product",
    });
    ProductVariation.belongsTo(models.Color, {
      foreignKey: "color_id",
      as: "Color",
    });
  };
};
