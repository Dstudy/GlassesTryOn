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
              {/* Text Content */}
              <div>
                <h1 className="font-headline text-5xl font-bold text-primary">
                  About Spectra Specs
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  We believe that glasses are more than just a tool for vision—they
                  are a core part of who you are.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Founded on the principle that finding the perfect pair of
                  glasses should be easy and enjoyable, Spectra Specs combines
                  premium craftsmanship with cutting-edge technology. From
                  AI-powered style recommendations to our virtual try-on feature,
                  we have simplified the entire process so you can shop with confidence.
                </p>
              </div>

              {/* Image Content */}
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/homepage/hero/hero2.avif"
                  alt="A pair of stylish frames"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* === Section 2: Core Values === */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Our Values
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            Our mission is to help you find the perfect frames that make you
            look and feel your best, backed by technology that makes everything simple.
          </p>

          {/* 3-Column Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Value 1 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Gem className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Superior Quality
              </h3>
              <p className="mt-2 text-muted-foreground">
                We source only the finest materials, from ultra-lightweight
                titanium to premium acetate, ensuring every pair is durable,
                comfortable, and built to last.
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Smart Shopping
              </h3>
              <p className="mt-2 text-muted-foreground">
                Our AI assistant and Virtual Try-On tools take the guesswork
                out of online shopping. Find styles that match your face shape
                and preferences instantly.
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-headline text-2xl font-semibold">
                Customer First
              </h3>
              <p className="mt-2 text-muted-foreground">
                Your confidence is our priority. From a seamless browsing
                experience to fast shipping, we are here to ensure you love
                your new glasses.
              </p>
            </div>
          </div>
        </section>

        {/* === Section 3: Call to Action (CTA) === */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="font-headline text-4xl font-bold">
              Find Your Perfect Pair
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Ready to see the difference? Explore our latest collection of
              frames and find your own unique look.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}