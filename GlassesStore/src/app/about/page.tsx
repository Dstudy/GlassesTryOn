"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gem, Sparkles, Users } from "lucide-react"; // Icons

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* === Section 1: Hero === */}
        <section className="bg-primary/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Phần văn bản */}
              <div>
                <h1 className="font-headline text-5xl font-bold text-primary">
                  Về Spectra Specs
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Chúng tôi tin rằng kính không chỉ là một công cụ để nhìn—chúng
                  là một phần cốt lõi của con người bạn.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Được thành lập dựa trên nguyên tắc rằng việc tìm kiếm một cặp
                  kính hoàn hảo phải dễ dàng và thú vị, Spectra Specs kết hợp
                  giữa tay nghề thủ công cao cấp và công nghệ tiên tiến. Từ các
                  đề xuất kiểu dáng do AI hỗ trợ cho đến tính năng thử kính ảo
                  (virtual try-on), chúng tôi đã đơn giản hóa toàn bộ quy trình
                  để bạn có thể tự tin mua sắm.
                </p>
              </div>

              {/* Phần hình ảnh */}
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  // Bạn có thể thay đổi hình ảnh này
                  src="/homepage/hero/hero2.avif"
                  alt="Một cặp gọng kính thời trang"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* === Section 2: Giá trị cốt lõi === */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Giá trị của chúng tôi
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            Sứ mệnh của chúng tôi là giúp bạn tìm thấy cặp gọng kính hoàn hảo,
            giúp bạn trông đẹp nhất và cảm thấy tuyệt vời nhất, được hỗ trợ bởi
            công nghệ giúp mọi thứ trở nên đơn giản.
          </p>

          {/* Grid 3 cột */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Giá trị 1 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Gem className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Chất lượng vượt trội
              </h3>
              <p className="mt-2 text-muted-foreground">
                Chúng tôi chỉ tìm nguồn cung ứng vật liệu tốt nhất, từ titan
                siêu nhẹ đến acetate cao cấp, đảm bảo mỗi cặp kính đều bền,
                thoải mái và được chế tạo để trường tồn.
              </p>
            </div>

            {/* Giá trị 2 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Mua sắm thông minh
              </h3>
              <p className="mt-2 text-muted-foreground">
                Trợ lý AI và công cụ Thử kính ảo của chúng tôi loại bỏ sự phỏng
                đoán khi mua sắm trực tuyến. Tìm kiếm các phong cách phù hợp với
                khuôn mặt và sở thích của bạn ngay lập tức.
              </p>
            </div>

            {/* Giá trị 3 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Khách hàng là trên hết
              </h3>
              <p className="mt-2 text-muted-foreground">
                Sự tự tin của bạn là ưu tiên của chúng tôi. Từ trải nghiệm duyệt
                web liền mạch đến giao hàng nhanh chóng, chúng tôi ở đây để đảm
                bảo bạn yêu thích cặp kính mới của mình.
              </p>
            </div>
          </div>
        </section>

        {/* === Section 3: Call to Action (CTA) === */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="font-headline text-4xl font-bold">
              Tìm cặp kính hoàn hảo của bạn
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Sẵn sàng để thấy sự khác biệt? Khám phá bộ sưu tập gọng kính mới
              nhất của chúng tôi và tìm ra vẻ ngoài độc đáo của riêng bạn.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Link href="/shop">Mua sắm ngay</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
