"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    name: "Linh A.",
    role: "Nhân viên văn phòng",
    quote:
      "Mình chọn được cả kính lẫn khuyên tai chỉ trong một lần mua. Giao diện dễ dùng, sản phẩm lên hình đẹp và nhận hàng cũng rất ưng.",
    image: "https://picsum.photos/100/100?random=1",
    rating: 5,
  },
  {
    name: "Mai N.",
    role: "Fashion creator",
    quote:
      "Phần gợi ý sản phẩm khá đúng gu. Mình tìm được một chiếc vòng cổ tối giản và một mẫu kính rất dễ phối đồ hằng ngày.",
    image: "https://picsum.photos/100/100?random=2",
    rating: 5,
  },
  {
    name: "Khánh T.",
    role: "Nhà thiết kế",
    quote:
      "Mình thích cách shop chọn mẫu. Từ kính đến trang sức đều có cảm giác hiện đại, gọn gàng và không bị đại trà.",
    image: "https://picsum.photos/100/100?random=3",
    rating: 5,
  },
  {
    name: "Vy P.",
    role: "Sinh viên",
    quote:
      "Giá ổn, hình ảnh rõ và phần bộ lọc giúp mình tìm khuyên tai rất nhanh. Trải nghiệm mua hàng khá mượt trên điện thoại.",
    image: "https://picsum.photos/100/100?random=4",
    rating: 5,
  },
  {
    name: "Hoàng D.",
    role: "Photographer",
    quote:
      "Mình đặt kính và vòng cổ cho một buổi chụp lookbook, nhận hàng đúng như mong đợi. Thiết kế đẹp và hoàn thiện tốt.",
    image: "https://picsum.photos/100/100?random=5",
    rating: 5,
  },
  {
    name: "Trang K.",
    role: "Content creator",
    quote:
      "Shop có gu rất rõ. Những món mình nhận được đều dễ phối, nổi bật vừa đủ và hợp để dùng hằng ngày lẫn chụp hình.",
    image: "https://picsum.photos/100/100?random=6",
    rating: 5,
  },
];

const renderStars = (rating: number) => {
  return Array(rating)
    .fill(0)
    .map((_, i) => (
      <Star key={i} className="h-5 w-5 fill-current text-amber-400" />
    ));
};

const reviews = testimonials.map((testimonial) => ({
  name: testimonial.name,
  username: `@${testimonial.role.replace(/\s+/g, "")}`,
  body: testimonial.quote,
  img: testimonial.image,
  rating: testimonial.rating,
}));

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

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
  rating: number;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-primary/10 bg-white/85 shadow-[0_16px_40px_-32px_hsl(var(--primary)/0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-white",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image className="rounded-full" width={32} height={32} alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm leading-6">{body}</blockquote>
      <div className="mt-2 flex justify-start">{renderStars(rating)}</div>
    </figure>
  );
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden border-y border-primary/10 bg-[linear-gradient(180deg,hsl(var(--primary)/0.05),transparent_20%),radial-gradient(circle_at_20%_18%,hsl(var(--accent)/0.12),transparent_22%),hsl(var(--background))] py-16 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Những chia sẻ chân thật từ khách hàng đã chọn kính, vòng cổ và khuyên tai tại Spectra Specs.
          </p>
        </div>

        <div className="relative mt-12 flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              <div key={review.username} className="mx-2">
                <ReviewCard {...review} />
              </div>
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              <div key={review.username} className="mx-2 mt-4">
                <ReviewCard {...review} />
              </div>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  );
}
