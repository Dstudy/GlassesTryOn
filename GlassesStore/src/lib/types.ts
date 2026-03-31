export interface Product {
  id: number;
  name: string;
  subtitle?: string;
  price: number;
  picUrl: string[]; // Mảng ảnh, ảnh đầu tiên làm ảnh bìa
  description: string;
  size?: string;
  dimensions: {
    width: number; // chiều ngang kính (mm)
    length: number; // chiều dài kính (mm)
    lensWidth: number; // độ rộng tròng (mm)
    lensHeight: number; // độ cao tròng (mm)
    bridge: number; // cầu mũi (mm)
  };
  shape: string; // Made flexible to handle any shape from API
  brand: string; // Made flexible to handle any brand from API
  material: string; // Made flexible to handle any material from API
  rating: number;
  isFeatured: boolean;
  color: string; // Màu sắc: Đỏ, đen, đen xanh, tím, ...
  features?: Array<{ id?: number; name: string; img?: string }>;
  // Optional fields that might come from API
  reviews: Review[];
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
  category?: string;
}

export type Review = {
  id?: number; // hoặc bất kỳ kiểu nào API trả về
  User: {
    id: number;
    fullname: string;
  };
  rating: number;
  review_text: string;
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductFilters {
  shape?: string;
  color?: string;
  brand?: string;
  material?: string;
  search?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}

export interface ProductVariant {
  id: number;
  productId: number;
  colorId: number;
  colorName: string;
  colorHex?: string;
  sku: string;
  price: number;
  stockQuantity: number;
  images: string[]; // sorted by display_order
}
