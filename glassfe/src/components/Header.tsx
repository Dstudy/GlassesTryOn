"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Check,
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const shopCategories = [
  { value: "glasses", label: "Kính" },
  { value: "necklaces", label: "Vòng cổ" },
  { value: "earrings", label: "Khuyên tai" },
];

const navLinks = [
  { href: "/#ai-assistant", label: "Trợ lý AI" },
  { href: "/#testimonials", label: "Đánh giá" },
  { href: "/about", label: "Về chúng tôi" },
];

function IconAction({ href, label, children, className }: { href: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          aria-label={label}
          className={cn(
            "relative inline-flex h-10 w-10 items-center justify-center overflow-visible rounded-full text-foreground/80",
            "border border-transparent bg-transparent hover:border-accent/20 hover:bg-accent/10 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:scale-[0.97]",
            className
          )}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="rounded-full border-primary/10 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-[0_18px_30px_-20px_hsl(var(--primary)/0.75)]">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Header() {
  const { cart, user, logout } = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeShopCategory = searchParams.get("category");
  const isShopActive = pathname === "/shop";

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (shopCloseTimeoutRef.current) {
        clearTimeout(shopCloseTimeoutRef.current);
      }
    };
  }, []);

  const clearShopCloseTimeout = () => {
    if (shopCloseTimeoutRef.current) {
      clearTimeout(shopCloseTimeoutRef.current);
      shopCloseTimeoutRef.current = null;
    }
  };

  const openShopMenu = () => {
    clearShopCloseTimeout();
    setShopMenuOpen(true);
  };

  const scheduleCloseShopMenu = () => {
    clearShopCloseTimeout();
    shopCloseTimeoutRef.current = setTimeout(() => {
      setShopMenuOpen(false);
      shopCloseTimeoutRef.current = null;
    }, 500);
  };

  const getNavLinkClasses = (href: string, isMobile = false) => {
    const isActive = isMounted && pathname === href;

    return cn(
      "relative inline-flex items-center text-sm font-medium tracking-[0.01em] transition-all duration-300 ease-out",
      "text-muted-foreground/90 hover:text-primary focus-visible:text-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out",
      "after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 active:scale-[0.98]",
      isActive && "text-primary after:scale-x-100",
      isMobile && "block w-full rounded-xl px-3 py-3 text-lg hover:bg-accent/10 active:bg-accent/15"
    );
  };

  const shopTriggerClasses = cn(
    "relative inline-flex items-center gap-1.5 text-sm font-medium tracking-[0.01em] transition-all duration-300 ease-out",
    "text-muted-foreground/90 hover:text-primary focus-visible:text-primary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out",
    "after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 active:scale-[0.98]",
    isShopActive && "text-primary after:scale-x-100"
  );

  const shopToggleClasses = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/90 transition-all duration-300 ease-out",
    "hover:bg-accent/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:scale-[0.98]",
    shopMenuOpen && "bg-accent/10 text-primary"
  );

  const handleNavigate = (href: string, isMobile = false) => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    router.push(href);
  };

  const renderNavButton = (
    href: string,
    label: string,
    isMobile = false,
  ) => (
    <button
      key={`${href}-${isMobile ? "mobile" : "desktop"}`}
      type="button"
      className={cn(getNavLinkClasses(href, isMobile), "z-10 pointer-events-auto")}
      onClick={() => handleNavigate(href, isMobile)}
    >
      {label}
    </button>
  );

  const renderNavLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={cn(getNavLinkClasses(href), "z-20 pointer-events-auto")}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-[500] isolate w-full border-b border-accent/20 bg-background/92 shadow-[0_10px_30px_-22px_hsl(var(--primary)/0.55)] backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 px-4">
        <div className="flex justify-start">
          <Link href="/" className="group flex items-center space-x-2">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-headline text-2xl font-bold text-transparent transition-transform duration-300 group-hover:scale-[1.02]">
              Spectra Specs
            </span>
          </Link>
        </div>

        <nav className="relative z-[510] hidden w-max items-center justify-self-center gap-6 pointer-events-auto md:flex">
          {renderNavLink("/", "Trang chủ")}

          <DropdownMenu
            open={shopMenuOpen}
            onOpenChange={(open) => {
              if (open) {
                openShopMenu();
              } else {
                clearShopCloseTimeout();
                setShopMenuOpen(false);
              }
            }}
          >
            <div
              className="relative flex items-center gap-1"
              onMouseEnter={openShopMenu}
              onMouseLeave={scheduleCloseShopMenu}
            >
              <Link
                href="/shop"
                className={cn(shopTriggerClasses, "z-20 pointer-events-auto")}
                onClick={() => {
                  clearShopCloseTimeout();
                  setShopMenuOpen(false);
                }}
              >
                <span>Cửa hàng</span>
              </Link>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Mở danh mục cửa hàng"
                  className={shopToggleClasses}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      shopMenuOpen && "rotate-180",
                      isShopActive && "text-primary"
                    )}
                  />
                </button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent
              align="start"
              alignOffset={-40}
              sideOffset={10}
              className="z-[650] w-64 rounded-2xl border border-border/60 bg-background/95 p-2 shadow-[0_24px_60px_-30px_hsl(var(--primary)/0.45)] backdrop-blur"
              onMouseEnter={openShopMenu}
              onMouseLeave={scheduleCloseShopMenu}
            >
              <DropdownMenuLabel className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Chọn danh mục
              </DropdownMenuLabel>
              {shopCategories.map((category) => {
                const isActiveCategory = isShopActive && activeShopCategory === category.value;
                return (
                  <DropdownMenuItem
                    key={category.value}
                    asChild
                    className="rounded-xl px-3 py-3 transition-all duration-200 ease-out focus:bg-accent/10 focus:text-primary data-[highlighted]:bg-accent/10 data-[highlighted]:text-primary"
                  >
                    <Link
                      href={`/shop?category=${category.value}`}
                      className="flex w-full items-center justify-between"
                      onClick={() => {
                  clearShopCloseTimeout();
                  setShopMenuOpen(false);
                }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{category.label}</span>
                        <span className="text-xs text-muted-foreground">Xem sản phẩm theo danh mục này</span>
                      </div>
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border border-accent/20 bg-accent/5 text-accent transition-all duration-200", isActiveCategory && "border-accent/40 bg-accent/15 text-primary")}>
                        {isActiveCategory ? <Check className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 -rotate-90" />}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => renderNavLink(link.href, link.label))}
        </nav>

        <div className="relative z-[510] flex shrink-0 items-center justify-end space-x-2">
          <TooltipProvider delayDuration={120}>
            <IconAction href="/cart" label="Giỏ hàng" className="shadow-[0_14px_30px_-24px_hsl(var(--primary)/0.55)]">
              <ShoppingCart className="h-5 w-5" />
              {isMounted && cartItemCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full bg-accent p-0 text-xs text-accent-foreground shadow-[0_10px_20px_-10px_hsl(var(--accent)/0.85)]">
                  {cartItemCount}
                </Badge>
              ) : null}
            </IconAction>
            <IconAction href="/orders" label="Đơn hàng">
              <Package className="h-5 w-5" />
            </IconAction>
            <IconAction href="/favorites" label="Yêu thích">
              <Heart className="h-5 w-5" />
            </IconAction>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className={cn("h-5 w-5", isMounted && user && "text-accent")} />
                      <span className="sr-only">Tài khoản</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="rounded-full border-primary/10 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-[0_18px_30px_-20px_hsl(var(--primary)/0.75)]">
                  <p>Tài khoản</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="rounded-2xl border border-primary/10 bg-background/95 p-2 shadow-[0_24px_50px_-30px_hsl(var(--primary)/0.42)]">
                {isMounted && user ? (
                  <>
                    <DropdownMenuLabel>Xin chào, {user.name}!</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Đăng nhập</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                      <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Đăng ký</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Bật tắt menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r border-primary/10 bg-background/95 backdrop-blur">
              <Link href="/" className="mb-8 mr-6 flex items-center space-x-2">
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-headline text-2xl font-bold text-transparent">
                  Spectra Specs
                </span>
              </Link>
              <nav className="grid gap-3">
                {renderNavButton("/", "Trang chủ", true)}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-2">
                  <div className="px-3 py-2 text-sm font-semibold text-foreground">Cửa hàng</div>
                  <div className="grid gap-1">
                    {shopCategories.map((category) => {
                      const isActiveCategory = isShopActive && activeShopCategory === category.value;
                      return (
                        <Link
                          key={category.value}
                          href={`/shop?category=${category.value}`}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-3 text-base transition-all duration-200 ease-out",
                            "text-muted-foreground hover:bg-accent/10 hover:text-primary active:scale-[0.99] active:bg-accent/15",
                            isActiveCategory && "bg-accent/10 text-primary"
                          )}
                          onClick={(event) => {
                            event.preventDefault();
                            handleNavigate(`/shop?category=${category.value}`, true);
                          }}
                        >
                          <span>{category.label}</span>
                          {isActiveCategory ? <Check className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 -rotate-90" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {navLinks.map((link) =>
                  renderNavButton(link.href, link.label, true),
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}



