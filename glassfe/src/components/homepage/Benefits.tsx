import { ShieldCheck, Gem, Sparkles, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Mẫu mã dễ phối",
    description:
      "Từ kính đến vòng cổ và khuyên tai, mỗi thiết kế đều được chọn theo hướng hiện đại, thanh lịch và dễ kết hợp hằng ngày.",
  },
  {
    icon: Gem,
    title: "Chất liệu chỉn chu",
    description:
      "Ưu tiên những chất liệu bền đẹp, nhẹ và có độ hoàn thiện tốt để mang lại cảm giác đeo thoải mái và sang hơn.",
  },
  {
    icon: Sparkles,
    title: "Gợi ý theo phong cách",
    description:
      "Bạn có thể khám phá sản phẩm theo danh mục, sở thích hoặc nhận gợi ý nhanh để chọn món phù hợp với cá tính riêng.",
  },
  {
    icon: Truck,
    title: "Giao hàng thuận tiện",
    description:
      "Theo dõi và nhận đơn nhanh chóng để việc mua kính, vòng cổ hay khuyên tai online trở nên nhẹ nhàng hơn.",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative overflow-hidden border-y border-primary/10 bg-[linear-gradient(180deg,hsl(var(--secondary)/0.32),transparent_24%),radial-gradient(circle_at_right_top,hsl(var(--accent)/0.12),transparent_24%),hsl(var(--background))] py-16 md:py-28"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-primary/10 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Lợi ích nổi bật
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Vì sao nên chọn Spectra Specs?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Chúng tôi kết hợp gu thẩm mỹ, sự tiện lợi và trải nghiệm mua sắm hiện đại để bạn chọn kính và trang sức dễ hơn.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group overflow-hidden rounded-3xl border border-primary/10 bg-white/92 text-center shadow-[0_20px_45px_-34px_hsl(var(--primary)/0.38)] transition-all duration-300 hover:-translate-y-2 hover:border-accent/40 hover:shadow-[0_28px_60px_-34px_hsl(var(--primary)/0.38)]"
            >
              <CardHeader className="pb-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--accent)/0.22),hsl(var(--primary)/0.12))] text-primary shadow-[0_18px_36px_-24px_hsl(var(--accent)/0.55)] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                  <benefit.icon className="h-7 w-7" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {benefit.title}
                </CardTitle>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
