import Link from 'next/link';
import { Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-headline text-2xl font-bold">Spectra Specs</h3>
            <p className="mt-2 text-primary-foreground/80">Stylish Eyewear for Every Vision</p>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-primary-foreground/80 hover:text-white">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-white">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-white">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-headline text-lg font-semibold">Shop</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="/shop" className="text-primary-foreground/80 hover:text-white">All Glasses</Link></li>
              <li><Link href="/shop" className="text-primary-foreground/80 hover:text-white">Men</Link></li>
              <li><Link href="/shop" className="text-primary-foreground/80 hover:text-white">Women</Link></li>
              <li><Link href="/shop" className="text-primary-foreground/80 hover:text-white">Sunglasses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg font-semibold">Support</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="#" className="text-primary-foreground/80 hover:text-white">Contact Us</Link></li>
              <li><Link href="#" className="text-primary-foreground/80 hover:text-white">FAQ</Link></li>
              <li><Link href="#" className="text-primary-foreground/80 hover:text-white">Shipping & Returns</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-4 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Spectra Specs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
