import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProductFeature = sequelize.define(
    "ProductFeature",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      feature_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "features",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: "product_features",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["product_id", "feature_id"],
        },
      ],
    }
  );

  return ProductFeature;
};
