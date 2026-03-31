import { DataTypes } from "sequelize";

const Reviews = (sequelize) => {
  // Tên biến 'Review' (số ít) thường rõ ràng hơn
  const Review = sequelize.define(
    "Reviews", // Tên logic của model trong Sequelize
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      product_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      rating: DataTypes.SMALLINT,
      review_text: DataTypes.STRING,
    },
    { tableName: "reviews", timestamps: true }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.User, {
      foreignKey: "user_id", // Khóa ngoại trong bảng 'reviews'
    });
    Review.belongsTo(models.Product, {
      foreignKey: "product_id", // Khóa ngoại trong bảng 'reviews'
    });
  };

  return Review;
};

export default Reviews;
