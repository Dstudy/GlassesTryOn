"use client";

import { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { authApi, ApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập email hợp lệ." }),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: LoginFormData) {
    try {
      // 1. Gọi API đăng nhập
      const userData = await authApi.login(data.email, data.password);

      // 2. Nếu thành công, gọi hàm login từ Context với dữ liệu chuẩn
      login(userData.id, userData.name, userData.roleID);

      toast({
        title: "Chào mừng quay lại!",
        description: "Bạn đã đăng nhập thành công.",
      });

      // 3. Chuyển hướng dựa trên roleID từ API
      if (userData.roleID === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      // 4. Xử lý lỗi đăng nhập
      console.error("Login failed:", error);

      // Hiển thị thông báo lỗi thân thiện
      const message =
        error instanceof ApiError &&
        (error.status === 404 || error.status === 401)
          ? "Email hoặc mật khẩu không đúng."
          : "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";

      toast({
        title: "Đăng nhập thất bại",
        description: message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-headline text-3xl font-bold tracking-tight text-primary block text-center mb-6"
        >
          Spectra Specs
        </Link>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập để truy cập tài khoản của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 text-sm">
            <p className="text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
