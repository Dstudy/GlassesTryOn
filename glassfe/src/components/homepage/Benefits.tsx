import { ShieldCheck, Droplets, Sparkles, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: ShieldCheck,
    title: "UV Protection",
    description:
      "All our lenses come with 100% UV protection to keep your eyes safe and sound.",
  },
  {
    icon: Droplets,
    title: "Waterproof Frames",
    description:
      "Our specially treated frames are resistant to water and sweat for lasting durability.",
  },
  {
    icon: Sparkles,
    title: "Premium Materials",
    description:
      "Crafted from high-quality acetate and lightweight metals for ultimate comfort and style.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description:
      "Enjoy free and fast shipping on all orders, delivered right to your doorstep.",
  },
];

export default function Benefits() {
  return (
    // <-- Tăng khoảng trắng (padding) cho section
    <section id="benefits" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* <-- Bỏ font-headline và text-primary, dùng font-semibold và màu chữ mặc định */}
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Why Choose Spectra Specs?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            We blend style with function to give you the best vision experience.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              // <-- Bỏ tất cả shadow, animation, scale. Thêm hover:bg-muted/50 (rất nhạt)
              className="text-center transition-colors hover:bg-muted/50"
            >
              <CardHeader>
                {/* <-- Đổi icon sang màu trung tính (muted) */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <benefit.icon className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                {/* <-- Bỏ font-headline và text-primary, dùng font-semibold và màu chữ mặc định */}
                <CardTitle className="text-xl font-semibold text-foreground">
                  {benefit.title}
                </CardTitle>
                <p className="mt-2 text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
