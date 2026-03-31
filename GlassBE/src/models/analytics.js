import { DataTypes } from "sequelize";

const Analytics = (sequelize) => {
  const AnalyticsModel = sequelize.define(
    "Analytics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      metric_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      metric_value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      metric_type: {
        type: DataTypes.ENUM("revenue", "count", "percentage"),
        allowNull: false,
      },
      period: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., "2024-01", "2024-Q1", "2024"',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "Additional data like previous period values, growth rates, etc.",
      },
    },
    {
      tableName: "analytics",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return AnalyticsModel;
};

export default Analytics;
