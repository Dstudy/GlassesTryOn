import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gem, Sparkles, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <section className="bg-primary/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h1 className="font-headline text-5xl font-bold text-primary">
                  Về Spectra Specs
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Chúng tôi tin rằng kính, vòng cổ và khuyên tai không chỉ là món phụ kiện để đeo, mà còn là cách bạn thể hiện gu thẩm mỹ mỗi ngày.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Spectra Specs được xây dựng với mong muốn giúp việc tìm ra món phụ kiện phù hợp trở nên dễ dàng, hiện đại và đáng tin cậy hơn. Từ trải nghiệm duyệt sản phẩm trực quan đến gợi ý bằng AI, chúng tôi tập trung vào cảm giác tiện lợi, thẩm mỹ và sự tự tin cho từng khách hàng.
                </p>
              </div>

              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-lg md:h-96">
                <Image
                  src="/homepage/hero/hero2.avif"
                  alt="Bộ sưu tập phụ kiện thời trang hiện đại"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center md:py-24">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Giá trị cốt lõi của chúng tôi
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-muted-foreground">
            Chúng tôi kết hợp thẩm mỹ, chất lượng và công nghệ để giúp bạn chọn kính và trang sức phù hợp với phong cách, nhu cầu và cá tính riêng.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
              <Gem className="mb-4 h-10 w-10 text-primary" />
              <h3 className="font-headline text-2xl font-semibold">
                Chất lượng vượt trội
              </h3>
              <p className="mt-2 text-muted-foreground">
                Chúng tôi ưu tiên các chất liệu bền đẹp, nhẹ và có độ hoàn thiện tốt để mỗi sản phẩm đều mang lại trải nghiệm sử dụng lâu dài.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
              <Sparkles className="mb-4 h-10 w-10 text-primary" />
              <h3 className="font-headline text-2xl font-semibold">
                Mua sắm thông minh
              </h3>
              <p className="mt-2 text-muted-foreground">
                Công nghệ AI và trải nghiệm duyệt sản phẩm trực quan giúp bạn chọn nhanh hơn, đúng gu hơn và tự tin hơn khi mua online.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
              <Users className="mb-4 h-10 w-10 text-primary" />
              <h3 className="font-headline text-2xl font-semibold">
                Khách hàng là ưu tiên
              </h3>
              <p className="mt-2 text-muted-foreground">
                Mọi chi tiết trong trải nghiệm của Spectra Specs đều hướng đến việc giúp bạn cảm thấy dễ chọn, dễ mua và hài lòng hơn.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-16 text-center md:py-24">
            <h2 className="font-headline text-4xl font-bold">
              Tìm món phù hợp với phong cách của bạn
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-primary-foreground/90">
              Sẵn sàng khám phá bộ sưu tập kính, vòng cổ và khuyên tai để hoàn thiện diện mạo theo cách riêng của bạn?
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Link href="/shop">Mua ngay</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
