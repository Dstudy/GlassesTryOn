"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroContent = {
  image: "hero5.png",
  alt: "Bộ sưu tập kính và trang sức hiện đại",
  headline: "Tỏa sáng với kính và trang sức hợp gu",
  subheadline:
    "Khám phá kính, vòng cổ và khuyên tai với thiết kế hiện đại, dễ phối và đủ nổi bật để hoàn thiện phong cách mỗi ngày.",
  ctaLabel: "Khám phá bộ sưu tập",
  ctaHref: "/shop",
};

export default function HeroSection() {
  const floatingIcons = [
    {
      Icon: Sparkles,
      className:
        "left-[4%] top-[16%] h-5 w-5 text-accent sm:left-[8%] sm:top-[14%] sm:h-6 sm:w-6",
      delay: "0s",
    },
    {
      Icon: Star,
      className:
        "left-[58%] top-[34%] hidden h-4 w-4 text-white/85 md:block lg:left-[52%]",
      delay: "0.8s",
    },
    {
      Icon: Gem,
      className:
        "left-[36%] top-[58%] hidden h-5 w-5 text-accent/90 md:block lg:left-[34%]",
      delay: "1.5s",
    },
    {
      Icon: Sparkles,
      className:
        "right-[18%] bottom-[28%] h-4 w-4 text-white/80 sm:right-[20%] sm:bottom-[26%] sm:h-5 sm:w-5",
      delay: "2.1s",
    },
    {
      Icon: Star,
      className:
        "left-[18%] bottom-[18%] h-4 w-4 text-accent/90 sm:left-[20%] sm:bottom-[16%] sm:h-5 sm:w-5",
      delay: "1.2s",
    },
  ];

  return (
    <section aria-label="Khuyến mãi nổi bật" className="relative overflow-hidden">
      <div className="relative h-[500px] w-full sm:h-[620px] md:h-[720px]">
        <Image
          src={`/homepage/hero/${heroContent.image}`}
          alt={heroContent.alt}
          fill
          priority
          className="hero-image-drift scale-[1.04] object-cover"
        />

        <div
          className="absolute inset-0 bg-[linear-gradient(102deg,hsl(var(--primary)/0.92)_4%,hsl(var(--primary)/0.74)_30%,transparent_70%),radial-gradient(circle_at_78%_22%,hsl(var(--accent)/0.3),transparent_24%),linear-gradient(180deg,transparent_6%,hsl(var(--primary)/0.62)_100%)]"
          aria-hidden
        />

        <div
          aria-hidden
          className="hero-orb-float absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-accent/25 blur-3xl sm:h-36 sm:w-36"
        />
        <div
          aria-hidden
          className="hero-orb-float absolute bottom-[18%] right-[9%] h-28 w-28 rounded-full bg-white/14 blur-3xl sm:h-40 sm:w-40"
          style={{ animationDelay: "1.2s" }}
        />
        {floatingIcons.map(({ Icon, className, delay }, index) => (
          <div
            key={index}
            aria-hidden
            className={`hero-orb-float absolute ${className}`}
            style={{ animationDelay: delay }}
          >
            <Icon className="h-full w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]" />
          </div>
        ))}

        <div className="absolute inset-0">
          <div className="container mx-auto grid h-full items-center px-4">
            <div className="max-w-3xl text-left">
              <h1 className="hero-fade-up max-w-2xl select-none font-headline text-4xl font-bold tracking-tight text-white drop-shadow-[0_14px_38px_rgba(0,0,0,0.34)] sm:text-5xl md:text-6xl lg:text-7xl">
                {heroContent.headline}
              </h1>

              <p
                className="hero-fade-up mt-5 max-w-2xl text-base leading-7 text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)] sm:text-lg md:text-xl"
                style={{ animationDelay: "0.12s" }}
              >
                {heroContent.subheadline}
              </p>

              <div
                className="hero-fade-up mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: "0.22s" }}
              >
                <Link href={heroContent.ctaHref}>
                  <Button
                    size="lg"
                    className="group relative overflow-hidden rounded-full border border-white/35 bg-[linear-gradient(135deg,hsl(46_100%_72%)_0%,hsl(var(--accent))_26%,hsl(38_96%_67%)_54%,hsl(var(--accent))_100%)] px-9 py-6 text-base font-bold text-accent-foreground shadow-[0_30px_80px_-16px_hsl(var(--accent)/1)] ring-1 ring-white/18 after:absolute after:inset-[-18%] after:-z-[1] after:rounded-full after:bg-[radial-gradient(circle,hsl(var(--accent)/0.55)_0%,transparent_62%)] after:blur-2xl before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_12%,rgba(255,255,255,0.72)_48%,transparent_84%)] before:opacity-40 before:transition-all before:duration-500 hover:-translate-y-1.5 hover:scale-[1.05] hover:shadow-[0_38px_95px_-14px_hsl(var(--accent)/1)] hover:before:translate-x-3"
                  >
                    <span className="absolute inset-x-6 top-0 h-px bg-white/70" aria-hidden />
                    <span className="absolute inset-x-5 bottom-1 h-3 rounded-full bg-[radial-gradient(circle,hsl(0_0%_100%/0.35),transparent_70%)] blur-md" aria-hidden />
                    <span className="relative z-[1] inline-flex items-center gap-2.5">
                      {heroContent.ctaLabel}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </Button>
                </Link>
              </div>

              <div
                className="hero-fade-up mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
                style={{ animationDelay: "0.32s" }}
              >
                <div className="hero-shine-card rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md">
                  <p className="text-2xl font-bold text-white sm:text-3xl">320+</p>
                  <p className="mt-1 text-sm text-white/75">Thiết kế nổi bật</p>
                </div>
                <div
                  className="hero-shine-card rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md"
                  style={{ animationDelay: "1.6s" }}
                >
                  <p className="text-2xl font-bold text-white sm:text-3xl">4.9/5</p>
                  <p className="mt-1 text-sm text-white/75">Khách hàng hài lòng</p>
                </div>
                <div
                  className="hero-shine-card col-span-2 rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md sm:col-span-1"
                  style={{ animationDelay: "3.2s" }}
                >
                  <p className="text-2xl font-bold text-white sm:text-3xl">24h</p>
                  <p className="mt-1 text-sm text-white/75">Giao nhanh toàn quốc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
