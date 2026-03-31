import React, { useState } from "react";

interface StarRatingProps {
  rating: number;
  size?: number;
  onRatingChange: (newRating: number) => void;
  color?: {
    filled: string;
    empty: string;
  };
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  onRatingChange,
  color = {
    filled: "#f5a623", // Vàng
    empty: "#d4d4d4", // Xám
  },
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating" style={{ display: "flex", gap: "4px" }}>
      {[...Array(5)].map((_, index) => {
        // Giá trị của sao này (từ 1 đến 5)
        const starValue = index + 1;

        // Quyết định xem sao có nên được "fill" (tô màu) hay không
        // Ưu tiên `hover` trước, nếu không có hover, dùng `rating`
        const isFilled = starValue <= (hover || rating);

        return (
          <span
            key={starValue}
            style={{
              cursor: "pointer",
              fontSize: `${size}px`,
              color: isFilled ? color.filled : color.empty,
              transition: "color 0.2s", // Hiệu ứng mượt mà
            }}
            // Khi nhấp chuột, gọi hàm callback để cập nhật state ở component cha
            onClick={() => onRatingChange(starValue)}
            // Khi di chuột vào, cập nhật state `hover`
            onMouseEnter={() => setHover(starValue)}
            // Khi di chuột ra, reset state `hover`
            onMouseLeave={() => setHover(0)}
          >
            ★ {/* Ký tự ngôi sao */}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
