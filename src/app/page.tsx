"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Shirt, Sofa, Laptop, BookOpen, UtensilsCrossed, Dumbbell, Package, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { label: "clothing", icon: Shirt },
  { label: "furniture", icon: Sofa },
  { label: "electronics", icon: Laptop },
  { label: "books", icon: BookOpen },
  { label: "kitchen", icon: UtensilsCrossed },
  { label: "sports", icon: Dumbbell },
  { label: "toysOther", icon: Package },
];

interface Donation {
  id: number;
  itemName: string;
  category: string;
  condition: string;
  location: string;
  photoUrls: string[] | null;
  description: string;
}

export default function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const response = await fetch("/api/donations?limit=3&status=available");
        if (response.ok) {
          const data = await response.json();
          setRecentDonations(data);
        }
      } catch (error) {
        console.error("Failed to fetch recent donations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentDonations();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/48684663-18a4-4525-a40e-379acad4b922/generated_images/serene-nature-landscape-wallpaper-with-l-71ae51ea-20251105164140.jpg"
            alt="Nature background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm">
              <HeartHandshake className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{t.heroTag}</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {t.heroDescription}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="px-8">
                <Link href="/donate">{t.donateAnItem}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 backdrop-blur-sm">
                <Link href="/browse">{t.browseDonations}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donations */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t.recentDonations}</h2>
            <p className="text-foreground/70 mt-1">{t.recentDonationsDescription}</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/browse">{t.seeAll}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentDonations.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDonations.map((donation) => (
              <Card key={donation.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground line-clamp-1">
                    {donation.itemName}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {donation.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {donation.condition}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{donation.location}</span>
                  </div>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/browse">{t.viewDetails}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noDonationsFound}</p>
          </div>
        )}
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