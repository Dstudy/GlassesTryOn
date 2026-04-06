"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type SlideAlignment = "left" | "center" | "right";

type HeroSlide = {
  image: string;
  alt: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  alignment?: SlideAlignment;
};

const slides: HeroSlide[] = [
  {
    image: "hero1.avif",
    alt: "Woman wearing stylish glasses outdoors",
    headline: "See Clearly. Live Boldly.",
    subheadline: "Premium eyewear for everyday confidence.",
    ctaLabel: "Shop Frames",
    ctaHref: "/shop",
    alignment: "right",
  },
  {
    image: "hero2.avif",
    alt: "Close-up of modern acetate frames",
    headline: "Crafted for Comfort",
    subheadline: "Lightweight, durable, and irresistibly stylish.",
    ctaLabel: "Explore Collection",
    ctaHref: "/shop",
    alignment: "left",
  },
  {
    image: "hero3.avif",
    alt: "Person reading with blue light lenses",
    headline: "Blue Light, No Stress",
    subheadline: "Protect your eyes during long screen time.",
    ctaLabel: "Shop Blue Light",
    ctaHref: "/shop",
    alignment: "left",
  },
];

function alignmentClasses(alignment: SlideAlignment | undefined) {
  switch (alignment) {
    case "center":
      return {
        container: "items-center text-center",
        text: "text-center",
      };
    case "right":
      return {
        container: "items-end text-right",
        text: "text-right",
      };
    case "left":
    default:
      return {
        container: "items-start text-left",
        text: "text-left",
      };
  }
}

export default function HeroSection() {
  return (
    <section aria-label="Featured promotions">
      <Carousel opts={{ loop: true }} className="relative">
        <CarouselContent>
          {slides.map((slide) => {
            const align = alignmentClasses(slide.alignment);
            return (
              <CarouselItem key={slide.image}>
                <div className="relative h-[420px] w-full sm:h-[520px] md:h-[640px]">
                  <Image
                    src={`/homepage/hero/${slide.image}`}
                    alt={slide.alt}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-0">
                    <div
                      className={`container mx-auto flex h-full flex-col justify-center gap-4 px-4 ${align.container}`}
                    >
                      <h1
                        className={`font-headline text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl select-none ${align.text}`}
                      >
                        {slide.headline}
                      </h1>
                      {slide.subheadline ? (
                        <p
                          className={`max-w-2xl text-base text-white/90 drop-shadow-sm sm:text-lg md:text-xl ${align.text}`}
                        >
                          {slide.subheadline}
                        </p>
                      ) : null}
                      {slide.ctaHref && slide.ctaLabel ? (
                        <div>
                          <Link href={slide.ctaHref}>
                            <Button size="lg" className="shadow-lg">
                              {slide.ctaLabel}
                            </Button>
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}
