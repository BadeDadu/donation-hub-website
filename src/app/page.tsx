"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Shirt, Sofa, Laptop, BookOpen, UtensilsCrossed, Dumbbell, Package } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

const CATEGORIES = [
  { label: "clothing", icon: Shirt },
  { label: "furniture", icon: Sofa },
  { label: "electronics", icon: Laptop },
  { label: "books", icon: BookOpen },
  { label: "kitchen", icon: UtensilsCrossed },
  { label: "sports", icon: Dumbbell },
  { label: "toysOther", icon: Package },
];

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background wallpaper */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/48684663-18a4-4525-a40e-379acad4b922/generated_images/modern-abstract-digital-wallpaper-with-v-54205157-20251105163336.jpg"
            alt="Donation platform background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay with vibrant gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-cyan-900/30" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/50 px-2 py-0.5 text-xs backdrop-blur-sm shadow-lg shadow-cyan-500/20">
              <HeartHandshake className="h-3 w-3 text-cyan-400" />
              <span className="font-medium text-cyan-100">{t.heroTag}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl drop-shadow-2xl">
              {t.heroTitle}
            </h1>
            <p className="mt-1.5 text-sm text-cyan-50 drop-shadow-lg">
              {t.heroDescription}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 border-0">
                <Link href="/donate">{t.donateAnItem}</Link>
              </Button>
              <Button asChild variant="outline" className="px-4 border-cyan-400/50 bg-slate-900/50 text-cyan-100 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400 backdrop-blur-sm shadow-lg">
                <Link href="/browse">{t.browseDonations}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t.popularCategories}</h2>
            <p className="text-foreground/70 mt-1">{t.categoriesDescription}</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/browse">{t.seeAll}</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.slice(0, 6).map(({ label, icon: Icon }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-foreground">{t[label as keyof typeof t]}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-foreground/70">{t.donationsNeeded}</p>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/browse">{t.browse}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold text-foreground">{t.howItWorks}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">{t.step1Title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                {t.step1Description}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">{t.step2Title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                {t.step2Description}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">{t.step3Title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                {t.step3Description}
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            <Badge variant="secondary" className="mr-2">{t.free}</Badge>
            <Badge variant="secondary" className="mr-2">{t.communityFirst}</Badge>
            <Badge variant="secondary">{t.simple}</Badge>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border p-6 sm:flex-row sm:items-center bg-card">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{t.readyToDonate}</h3>
            <p className="text-foreground/70">{t.readyDescription}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/donate">{t.startDonating}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/browse">{t.browseItems}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}