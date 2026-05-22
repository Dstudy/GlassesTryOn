import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      subtitle: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      brand_id: { type: DataTypes.INTEGER },
      shape_id: { type: DataTypes.INTEGER },
      material_id: { type: DataTypes.INTEGER },
      category_id: { type: DataTypes.INTEGER },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      size: { type: DataTypes.STRING },
      length: { type: DataTypes.FLOAT },
      width: { type: DataTypes.FLOAT },
      lens_width: { type: DataTypes.FLOAT },
      lens_height: { type: DataTypes.FLOAT },
      bridge: { type: DataTypes.FLOAT },
      isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
      rating: { type: DataTypes.FLOAT, defaultValue: 0 },
      review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      url: { type: DataTypes.STRING },
      tryOnUrl: { type: DataTypes.STRING },
      face_suitable: { type: DataTypes.STRING },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: "products",
      timestamps: false,
    },
  );

  Product.associate = (models) => {
    Product.belongsToMany(models.Feature, {
      through: models.ProductFeature,
      foreignKey: "product_id",
      otherKey: "feature_id",
    });
    Product.hasMany(models.Review, {
      foreignKey: "product_id",
    });
  };

  // This must be INSIDE the export default function
  return Product;
};
