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

// 1. Tạo schema xác thực cho đăng ký
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
    email: z.string().email({ message: "Vui lòng nhập email hợp lệ." }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // 2. Sử dụng hàm 'register' từ context
  // (Bạn đã thêm hàm này vào AppContext.tsx ở các bước trước)
  const { register } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Lấy trạng thái 'isSubmitting'
  const { isSubmitting } = form.formState;

  // 3. Cập nhật hàm onSubmit để gọi authApi.register
  async function onSubmit(data: RegisterFormData) {
    try {
      // Gọi API đăng ký
      const userData = await authApi.register(
        data.name,
        data.email,
        data.password
      );

      // Nếu thành công, gọi hàm 'register' của context (để đăng nhập)
      register(userData.id, userData.name, userData.roleID);

      toast({
        title: "Tạo tài khoản thành công!",
        description: "Bạn đã tạo tài khoản thành công.",
      });

      // Chuyển hướng về trang chủ
      router.push("/");
    } catch (error) {
      console.error("Registration failed:", error);

      // Xử lý lỗi (ví dụ: email đã tồn tại)
      const message =
        error instanceof ApiError && error.status === 409 // 409 Conflict
          ? "Email này đã được sử dụng."
          : "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";

      toast({
        title: "Đăng ký thất bại",
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
              Tạo tài khoản
            </CardTitle>
            <CardDescription>
              Nhập thông tin của bạn để bắt đầu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Thêm trường 'Name' */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {...field}
                          disabled={isSubmitting}
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
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Thêm trường 'Confirm Password' */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
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
                  {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 text-sm">
            <p className="text-muted-foreground">
              {/* Đổi link chân trang */}
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
