"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Package, Heart, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

interface Donation {
  id: number;
  itemName: string;
  category: string;
  condition: string;
  location: string;
  status: string;
  createdAt: string;
}

interface Request {
  id: number;
  donationId: number;
  ngoName: string;
  purpose: string;
  status: string;
  createdAt: string;
  donation: {
    itemName: string;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    contact: string;
  } | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("user_authenticated");
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Get user info from localStorage
    const name = localStorage.getItem("user_name") || "";
    const email = localStorage.getItem("user_email") || "";
    const contact = localStorage.getItem("user_contact") || "";

    setUserInfo({ name, email, contact });

    // Fetch user's donations and requests
    fetchUserData(email);
  }, [router]);

  const fetchUserData = async (email: string) => {
    setIsLoading(true);
    try {
      // Fetch donations
      const donationsRes = await fetch(`/api/donations`);
      if (donationsRes.ok) {
        const allDonations = await donationsRes.json();
        // Filter donations by user's email
        const userDonations = allDonations.filter(
          (d: Donation & { contactEmail: string }) => d.contactEmail === email
        );
        setDonations(userDonations);
      }

      // Fetch requests
      const requestsRes = await fetch(`/api/requests`);
      if (requestsRes.ok) {
        const allRequests = await requestsRes.json();
        // Filter requests by user's email
        const userRequests = allRequests.filter(
          (r: Request & { requesterEmail: string }) => r.requesterEmail === email
        );
        setRequests(userRequests);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t.loading}</span>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t.myProfile}</CardTitle>
            <CardDescription>{t.name}: {userInfo.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.name}</p>
                  <p className="font-medium">{userInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.email}</p>
                  <p className="font-medium">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.phone}</p>
                  <p className="font-medium">{userInfo.contact}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{donations.length}</p>
                  <p className="text-sm text-muted-foreground">{t.totalDonations}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-sm text-muted-foreground">{t.totalRequests}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Donations */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myDonations}</CardTitle>
            <CardDescription>
              {donations.length > 0 
                ? `${t.showing} ${donations.length} ${donations.length === 1 ? t.donation : t.donations}`
                : t.noDonationsYet}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length > 0 ? (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{donation.itemName}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{donation.category}</Badge>
                        <Badge variant="outline">{donation.condition}</Badge>
                        <span>📍 {donation.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          donation.status === "available"
                            ? "default"
                            : donation.status === "claimed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {donation.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t.noDonationsYet}</p>
                <Button asChild className="mt-4">
                  <a href="/donate">{t.donateAnItem}</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myRequests}</CardTitle>
            <CardDescription>
              {requests.length > 0
                ? `${t.showing} ${requests.length} ${requests.length === 1 ? t.request : t.requests}`
                : t.noRequestsYet}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {request.donation?.itemName || t.itemNotAvailable}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{t.ngo}: {request.ngoName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.purpose}: {request.purpose}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t.noRequestsYet}</p>
                <Button asChild className="mt-4" variant="outline">
                  <a href="/browse">{t.browseDonations}</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}