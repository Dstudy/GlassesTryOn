import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Feature = sequelize.define(
    "Feature",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      img: { type: DataTypes.STRING },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: "features",
      timestamps: true,
    }
  );

  Feature.associate = (models) => {
    Feature.belongsToMany(models.Product, {
      through: models.ProductFeature,
      foreignKey: "feature_id",
      otherKey: "product_id",
    });
  };

  return Feature;
};
