"use client";

import Image from "next/image";
// THAY ĐỔI: Xóa Card, CardContent
import { Star } from "lucide-react";
// THAY ĐỔI: Thêm cn và Marquee từ đúng đường dẫn
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

// Mảng testimonials gốc của bạn
const testimonials = [
  {
    name: "Sarah L.",
    role: "Fashion Blogger",
    quote:
      "I'm in love with my new glasses from Spectra Specs! The quality is amazing, and I get compliments everywhere I go. The AI assistant helped me find the perfect pair.",
    image: "https://picsum.photos/100/100?random=1",
    rating: 5,
  },
  {
    name: "Michael B.",
    role: "Software Engineer",
    quote:
      "Finally, glasses that are both stylish and comfortable for long hours in front of the screen. The ordering process was seamless, and they arrived super fast.",
    image: "https://picsum.photos/100/100?random=2",
    rating: 5,
  },
  {
    name: "Jessica T.",
    role: "Graphic Designer",
    quote:
      "The collection is stunning! It was hard to choose just one pair. The frames are lightweight and the prescription is spot on. Highly recommended!",
    image: "https://picsum.photos/100/100?random=3",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Marketing Manager",
    quote:
      "The virtual try-on feature is a game-changer! I was hesitant to buy glasses online, but it made all the difference. My new frames fit perfectly.",
    image: "https://picsum.photos/100/100?random=4",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "Student",
    quote:
      "Affordable, durable, and stylish. As a student on a budget, Spectra Specs ticked all the boxes. Plus, the customer service was incredibly helpful.",
    image: "https://picsum.photos/100/100?random=5",
    rating: 5,
  },
  {
    name: "Alex J.",
    role: "Photographer",
    quote:
      "I'm very particular about my glasses, and I was impressed by the unique designs. The quality of the lenses is top-notch. I'll be back for sunglasses.",
    image: "https://picsum.photos/100/100?random=6",
    rating: 5,
  },
];

// Hàm renderStars gốc của bạn
const renderStars = (rating: number) => {
  return Array(rating)
    .fill(0)
    .map((_, i) => (
      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
    ));
};

// THAY ĐỔI: Chuyển đổi dữ liệu của bạn sang định dạng của 'reviews'
const reviews = testimonials.map((t) => ({
  name: t.name,
  username: `@${t.role.replace(/\s+/g, "")}`, // Tạo username từ 'role'
  body: t.quote,
  img: t.image,
  rating: t.rating, // Thêm rating
}));

// THAY ĐỔI: Chia làm 2 hàng
const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

// THAY ĐỔI: Tạo component ReviewCard (dựa trên ví dụ của bạn + thêm rating)
const ReviewCard = ({
  img,
  name,
  username,
  body,
  rating,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  rating: number; // Thêm rating vào props
}) => {
  return (
    <figure
      className={cn(
        // Đặt kích thước cố định, h-full để đảm bảo chiều cao nhất quán
        "relative w-64 h-full cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image // Sử dụng Next/Image
          className="rounded-full"
          width="32"
          height="32"
          alt={name}
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
      {/* Thêm lại phần hiển thị sao */}
      <div className="mt-2 flex justify-start">{renderStars(rating)}</div>
    </figure>
  );
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        {/* Phần tiêu đề gốc của bạn */}
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Real stories from our happy customers.
          </p>
        </div>

        {/* THAY ĐỔI: Sử dụng cấu trúc Marquee từ ví dụ của bạn */}
        <div className="relative mt-12 flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              // Thêm 'mx-2' để tạo khoảng cách giữa các thẻ
              <div key={review.username} className="mx-2">
                <ReviewCard {...review} />
              </div>
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              // Thêm 'mx-2' để tạo khoảng cách giữa các thẻ
              <div key={review.username} className="mx-2 mt-4">
                <ReviewCard {...review} />
              </div>
            ))}
          </Marquee>
          {/* Lớp phủ mờ ở hai bên */}
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </section>
  );
}
