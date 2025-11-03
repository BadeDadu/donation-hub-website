"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

const CATEGORIES = [
  "Clothing",
  "Furniture",
  "Electronics",
  "Books",
  "Toys",
  "Kitchen",
  "Sports",
  "Other",
];

export default function DonatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorContact, setDonorContact] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // Check authentication - use the same key as signup
    const authenticated = localStorage.getItem("user_authenticated");
    if (authenticated !== "true") {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
    
    // Load user details
    const name = localStorage.getItem("user_name") || "";
    const email = localStorage.getItem("user_email") || "";
    const contact = localStorage.getItem("user_contact") || "";
    setDonorName(name);
    setDonorEmail(email);
    setDonorContact(contact);
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    
    const payload = {
      donorName: data.get('donorName') as string,
      contactNumber: data.get('contactPhone') as string,
      itemName: data.get('title') as string,
      category: category,
      condition: condition,
      description: data.get('description') as string,
      photoUrls: null,
      location: data.get('location') as string,
      contactEmail: data.get('contactEmail') as string,
      contactPhone: data.get('contactPhone') as string,
    };

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit donation');
      }

      toast.success('Thank you! Your donation has been listed successfully.');
      form.reset();
      setCategory("");
      setCondition("");
      
      // Redirect to browse page after 1 second
      setTimeout(() => router.push('/browse'), 1000);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t.donatePageTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.donatePageDescription}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="donorName">{t.yourName}</Label>
          <Input id="donorName" name="donorName" placeholder="e.g., Alex Johnson" defaultValue={donorName} required />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">{t.itemName}</Label>
            <Input id="title" name="title" placeholder="e.g., Winter Jacket" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t.category}</Label>
            <Select name="category" required value={category} onValueChange={setCategory}>
              <SelectTrigger id="category"><SelectValue placeholder={t.selectCategory} /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="condition">{t.condition}</Label>
            <Select name="condition" required value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition"><SelectValue placeholder={t.selectCondition} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Like New">{t.likeNew}</SelectItem>
                <SelectItem value="Good">{t.good}</SelectItem>
                <SelectItem value="Fair">{t.fair}</SelectItem>
                <SelectItem value="Needs Repair">{t.needsRepair}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t.yourLocation}</Label>
            <Input id="location" name="location" placeholder="City, Country" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t.description}</Label>
          <Textarea id="description" name="description" placeholder={t.descriptionPlaceholder} rows={5} required />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t.contactEmail}</Label>
            <Input id="contactEmail" name="contactEmail" type="email" placeholder="you@example.com" defaultValue={donorEmail} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">{t.contactPhone || "Contact Number"}</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+1234567890" defaultValue={donorContact} required />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" className="px-6" disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submitDonation}
          </Button>
          <span className="text-xs text-muted-foreground">{t.bySubmitting}</span>
        </div>
      </form>
    </div>
  );
}