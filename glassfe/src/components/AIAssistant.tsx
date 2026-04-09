"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { getGlassesRecommendation, AIFormState } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Sparkles, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import "./AIAssistantButton.css";

const initialState: AIFormState = {
  message: null,
  recommendation: null,
  recommendedProducts: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("ai-submit-button", "w-full sm:w-auto")}
    >
      <svg
        viewBox="0 0 24 24"
        height="24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="currentColor"
      >
        <g fill="none">
          <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
          <path
            d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026.35l.35-1.027A1 1 0 0 1 19 2"
            fill="currentColor"
          ></path>
        </g>
      </svg>
      {pending ? "Đang phân tích..." : "Nhận gợi ý"}
    </button>
  );
}

export default function AIAssistant() {
  const [state, formAction] = useActionState(
    getGlassesRecommendation,
    initialState,
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.recommendation) {
      toast({
        title: "Chưa thể gợi ý",
        description: state.message,
        variant: "destructive",
      });
    }
    if (state.recommendation) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <section
      id="ai-assistant"
      className="relative w-full overflow-hidden border-y border-primary/10 bg-[linear-gradient(180deg,hsl(var(--primary)/0.08),transparent_18%),radial-gradient(circle_at_top,hsl(var(--accent)/0.16),transparent_24%),hsl(var(--background))] py-16 md:py-28 lg:py-32"
    >
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary md:text-4xl">
                Trợ lý chọn phong cách AI
              </CardTitle>
              <CardDescription className="text-lg">
                Hãy cho chúng tôi biết phong cách hoặc nhu cầu của bạn, AI sẽ gợi ý những mẫu kính, vòng cổ hoặc khuyên tai phù hợp nhất.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} action={formAction} className="space-y-4">
                <Textarea
                  id="needs"
                  name="needs"
                  placeholder="Ví dụ: 'Tôi muốn một cặp kính thanh lịch để đi làm', 'Tôi cần khuyên tai nhỏ gọn để đeo hằng ngày' hoặc 'Gợi ý cho tôi một vòng cổ tối giản để dễ phối đồ'"
                  className="min-h-[100px] text-base"
                  required
                />
                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <SubmitButton />
                </div>
              </form>

              {state.recommendation && (
                <div key={state.timestamp} className="mt-6 animate-in fade-in-50 duration-500">
                  <Card className="border-primary/20 bg-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                        <Sparkles className="h-5 w-5 text-accent" />
                        Gợi ý dành cho bạn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-primary/90">{state.recommendation}</p>
                      {state.recommendedProducts && state.recommendedProducts.length > 0 && (
                        <div className="mt-6">
                          <h4 className="mb-4 font-headline text-lg text-primary">
                            Sản phẩm phù hợp:
                          </h4>
                          <Carousel opts={{ align: "start", loop: true }} className="w-full">
                            <CarouselContent className="-ml-4">
                              {state.recommendedProducts.map((product, index) => (
                                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                  <div className="p-1">
                                    <ProductCard product={product} />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-12" />
                            <CarouselNext className="mr-12" />
                          </Carousel>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
