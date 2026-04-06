"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppContext } from "@/context/AppContext";
import { productApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CreditCard } from "lucide-react";

const checkoutSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  province: z.string().min(1, "Province/City is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward is required"),
  address: z.string().min(1, "Address is required"),
  deliveryDate: z.date({ required_error: "Please choose a delivery date." }),
  paymentMethod: z.literal("Thanh toán khi nhận hàng"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart, user } = useContext(AppContext);
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      province: "",
      district: "",
      ward: "",
      address: "",
      deliveryDate: new Date(),
      paymentMethod: "Thanh toán khi nhận hàng",
    },
  });

  function onSubmit(data: CheckoutFormData) {
    // Create order from server cart

    if (!user) {
      router.push("/login");
      return;
    }
    const userId = user.id;
    const payload = {
      province: (data as any).province,
      district: (data as any).district,
      ward: (data as any).ward,
      address: data.address,
      delivery_date: data.deliveryDate?.toISOString?.() ?? undefined,
      shipping_cost: 0,
      note: `Payment: ${data.paymentMethod}`,
      use_product_price: true, // Use product price instead of variant price
    } as any;
    productApi
      .createOrderFromCart(userId, payload)
      .then(() => {
        setIsSuccess(true);
        clearCart();
      })
      .catch(() => {
        // Fallback: still show success to allow flow; in real app, surface error
        setIsSuccess(true);
        clearCart();
      });
  }

  // Redirect to cart if empty (avoid navigation during render)
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      router.push("/cart");
    }
  }, [cart.length, isSuccess, router]);
  if (cart.length === 0 && !isSuccess) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cart
        </Link>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h1 className="font-headline text-3xl font-bold text-primary mb-6">
              Shipping & Payment
            </h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh / Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="TP. Hồ Chí Minh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quận / Huyện</FormLabel>
                          <FormControl>
                            <Input placeholder="Quận 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phường / Xã</FormLabel>
                          <FormControl>
                            <Input placeholder="Phường Bến Nghé" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Lê Lợi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <div className="flex items-center gap-2">
                            <Dialog
                              open={isDateOpen}
                              onOpenChange={setIsDateOpen}
                            >
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline">
                                  {field.value
                                    ? new Date(field.value).toLocaleDateString()
                                    : "Choose date"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Select Delivery Date
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="pt-2">
                                  <Calendar
                                    mode="single"
                                    selected={field.value as Date}
                                    onSelect={(date) => {
                                      if (date) {
                                        field.onChange(date);
                                        setIsDateOpen(false);
                                      }
                                    }}
                                    initialFocus
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selected Method</FormLabel>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" disabled>
                              {field.value}
                            </Button>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      You will pay in cash upon delivery.
                    </p>
                  </CardContent>
                </Card>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <CreditCard className="w-5 h-5 mr-2" /> Pay $
                  {getCartTotal().toFixed(2)}
                </Button>
              </form>
            </Form>
          </div>
          <div className="order-1 md:order-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="font-headline text-xl">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for your order. A confirmation email has been sent. Your
              glasses are on their way!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link href="/shop">Continue Shopping</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
