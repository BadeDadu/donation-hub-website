"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

interface Donation {
  id: number;
  itemName: string;
  category: string;
  location: string;
  photoUrls: string[] | null;
  condition: string;
  description: string;
  donorName: string;
  status: string;
}

export default function BrowsePage() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const CATEGORIES = [
    { label: t.all, value: "all" },
    { label: t.clothing, value: "Clothing" },
    { label: t.furniture, value: "Furniture" },
    { label: t.electronics, value: "Electronics" },
    { label: t.books, value: "Books" },
    { label: t.toys, value: "Toys" },
    { label: t.kitchen, value: "Kitchen" },
    { label: t.sports, value: "Sports" },
    { label: t.other, value: "Other" },
  ];

  useEffect(() => {
    async function fetchDonations() {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          limit: '100',
          status: 'available'
        });
        
        if (category !== 'all') {
          params.append('category', category);
        }
        
        if (query.trim()) {
          params.append('search', query.trim());
        }

        const response = await fetch(`/api/donations?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch donations');
        }
        
        const data = await response.json();
        setDonations(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load donations');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDonations();
  }, [category, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t.browseDonationsTitle}</h1>
        <div className="flex gap-3">
          <Input 
            placeholder={t.searchPlaceholder}
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="w-72" 
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44"><SelectValue placeholder={t.category} /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-muted-foreground mt-16">{t.loadingDonations}</div>
      )}

      {error && (
        <div className="text-center text-destructive mt-16">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm underline mt-2">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {donations.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">{item.itemName}</CardTitle>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{item.location}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge>{item.condition}</Badge>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{t.donatedBy || "Donated by"}: {item.donorName}</p>
                  </div>
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <a href={`/request?donationId=${item.id}`}>{t.requestItem}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {donations.length === 0 && (
            <div className="text-center text-muted-foreground mt-16">{t.noItemsMatch}</div>
          )}
        </>
      )}
    </div>
  );
}