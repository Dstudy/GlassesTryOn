import Link from "next/link";
import { Twitter, Facebook, Instagram, ArrowUpRight } from "lucide-react";

const footerLinkClass =
  "group inline-flex items-center gap-2 text-primary-foreground/78 transition-all duration-300 hover:text-white";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.12),transparent_28%),linear-gradient(180deg,hsl(var(--primary)),hsl(var(--primary)/0.98))] text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-headline text-2xl font-bold">Spectra Specs</h3>
            <p className="mt-3 max-w-sm text-primary-foreground/78">
              Không gian mua sắm hiện đại dành cho kính, vòng cổ và khuyên tai với thiết kế tinh tế, dễ chọn và dễ phối.
            </p>
            <div className="mt-5 flex gap-3">
              {[Twitter, Facebook, Instagram].map((Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primary-foreground/80 shadow-[0_14px_30px_-22px_rgba(255,255,255,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-accent/18 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-headline text-lg font-semibold">Cửa hàng</h4>
            <ul className="mt-3 space-y-3">
              <li><Link href="/shop" className={footerLinkClass}>Tất cả sản phẩm <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
              <li><Link href="/shop?category=glasses" className={footerLinkClass}>Kính <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
              <li><Link href="/shop?category=necklaces" className={footerLinkClass}>Vòng cổ <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
              <li><Link href="/shop?category=earrings" className={footerLinkClass}>Khuyên tai <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg font-semibold">Hỗ trợ</h4>
            <ul className="mt-3 space-y-3">
              <li><Link href="#" className={footerLinkClass}>Liên hệ <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
              <li><Link href="#" className={footerLinkClass}>Câu hỏi thường gặp <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
              <li><Link href="#" className={footerLinkClass}>Vận chuyển và hoàn trả <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/12 pt-5 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Spectra Specs. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
