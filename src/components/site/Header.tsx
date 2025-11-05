"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Languages, LogOut, Shield, User } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const authenticated = localStorage.getItem("user_authenticated") === "true";
    const adminAuth = localStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(authenticated);
    setIsAdmin(adminAuth);
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("user_authenticated");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_contact");
    
    setIsAuthenticated(false);
    setOpen(false);
    router.push("/");
  };

  const NavLinks = () => (
    <ul className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <li><Link href="/" className="hover:underline transition-colors hover:text-primary">{t.home}</Link></li>
      <li><Link href="/browse" className="hover:underline transition-colors hover:text-primary">{t.browse}</Link></li>
      <li><Link href="/about" className="hover:underline transition-colors hover:text-primary">{t.about}</Link></li>
      {isAuthenticated && (
        <li><Link href="/profile" className="hover:underline transition-colors hover:text-primary">{t.profile || "Profile"}</Link></li>
      )}
      {isAdmin && (
        <li><Link href="/admin" className="hover:underline transition-colors hover:text-primary">{t.admin || "Admin"}</Link></li>
      )}
    </ul>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
          <Image 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/48684663-18a4-4525-a40e-379acad4b922/generated_images/modern-minimal-logo-for-daansetu-donatio-22c5abf7-20250930165257.jpg"
            alt="DaanSetu Logo"
            width={32}
            height={32}
            className="size-8 rounded-md object-cover shadow-sm"
          />
          <span>DaanSetu</span>
        </Link>

        <nav className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Change language" className="hover:bg-muted/50">
                <Languages className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                English {language === "en" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("hi")}>
                हिन्दी {language === "hi" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("mr")}>
                मराठी {language === "mr" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="hidden md:inline-flex gap-2 bg-card/50 hover:bg-card border-border/40"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              {t.logout || "Log Out"}
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="hidden md:inline-flex bg-card/50 hover:bg-card border-border/40">
                <Link href="/login">{t.login || "Log In"}</Link>
              </Button>

              <Button asChild className="hidden md:inline-flex">
                <Link href="/signup">{t.signUp || "Sign Up"}</Link>
              </Button>

              <Button asChild variant="ghost" className="hidden md:inline-flex hover:bg-muted/50">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-card/50 hover:bg-card border-border/40" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="mt-8 space-y-6">
                <Link href="/" onClick={() => setOpen(false)} className="block text-lg font-semibold">DaanSetu</Link>
                <NavLinks />
                <div className="flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" />
                      {t.logout || "Log Out"}
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                        <Link href="/login">{t.login || "Log In"}</Link>
                      </Button>
                      <Button asChild className="w-full" onClick={() => setOpen(false)}>
                        <Link href="/signup">{t.signUp || "Sign Up"}</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                        <Link href="/admin/login">Admin Login</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}