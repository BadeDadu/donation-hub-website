"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3">
        <div>
          <div className="font-semibold text-lg text-foreground">DaanSetu</div>
          <p className="text-sm text-muted-foreground mt-2">
            Connecting generous donors with local needs. Give items a second life.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-foreground/80">Pages</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:underline hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/browse" className="hover:underline hover:text-primary transition-colors">Browse</Link></li>
              <li><Link href="/donate" className="hover:underline hover:text-primary transition-colors">Donate</Link></li>
              <li><Link href="/about" className="hover:underline hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-foreground/80">Contact</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="mailto:donate@daansetu@gmail.com" className="hover:underline hover:text-primary transition-colors">donate@daansetu@gmail.com</a></li>
            </ul>
          </div>
        </nav>
        <div className="text-xs text-muted-foreground md:text-right">
          © {new Date().getFullYear()} DaanSetu. All rights reserved.
        </div>
      </div>
    </footer>
  );
}