"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Package,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/#ai-assistant", label: "AI Assistant" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/about", label: "About us" },
];

export default function Header() {
  const { cart, user, logout } = useContext(AppContext);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Effect này chỉ chạy trên client, sau khi component đã mount
    setIsMounted(true);
  }, []); // Mảng rỗng `[]` đảm bảo nó chỉ chạy một lần

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isMounted && pathname === link.href
            ? "text-primary"
            : "text-muted-foreground",
          isMobile && "block w-full p-3 text-lg"
        )}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        {link.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="container mx-auto flex h-16 items-center px-4 ">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-headline text-2xl font-bold text-primary">
              Spectra Specs
            </span>
          </Link>
        </div>
        <nav className="hidden gap-6 md:flex">{renderNavLinks()}</nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {isMounted && cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-xs bg-accent text-accent-foreground">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <Package className="h-5 w-5" />
              <span className="sr-only">Orders</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favorites">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favorites</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User
                  className={cn(
                    "h-5 w-5",
                    isMounted && user && "text-accent" // Làm nổi bật icon nếu đã đăng nhập
                  )}
                />
                <span className="sr-only">User Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isMounted && user ? (
                // --- Trường hợp đã đăng nhập ---
                <>
                  <DropdownMenuLabel>Hello, {user.name}!</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                // --- Trường hợp chưa đăng nhập ---
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/login" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Log In</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/register" passHref>
                    <DropdownMenuItem className="cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Register</span>
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-8">
                <span className="font-headline text-2xl font-bold text-primary">
                  Spectra Specs
                </span>
              </Link>
              <nav className="grid gap-4">{renderNavLinks(true)}</nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
