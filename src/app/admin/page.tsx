"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

interface Donation {
  id: number;
  donorName: string;
  contactNumber: string;
  donationType: string;
  itemName: string;
  category: string;
  condition: string;
  description: string;
  photoUrls: string[] | string | null;
  location: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Request {
  id: number;
  donationId: number;
  requesterName: string;
  requesterEmail: string;
  requesterContact: string;
  ngoName: string;
  purpose: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("donations");
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("admin_authenticated");
    if (authenticated !== "true") {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [donationsRes, requestsRes] = await Promise.all([
        fetch("/api/donations?limit=100"),
        fetch("/api/requests"),
      ]);

      if (!donationsRes.ok || !requestsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const donationsData = await donationsRes.json();
      const requestsData = await requestsRes.json();

      setDonations(donationsData);
      setRequests(requestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: number, newStatus: string, donationId: number) => {
    try {
      // Update request status
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      toast.success(`Request ${newStatus} successfully`);

      // Refresh data
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "claimed":
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const parsePhotoUrls = (photoUrls: string[] | string | null): string[] => {
    if (!photoUrls) return [];
    if (Array.isArray(photoUrls)) return photoUrls;
    try {
      const parsed = JSON.parse(photoUrls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{t.adminDashboard}</h1>
            <p className="text-muted-foreground mt-2">
              {t.adminDescription}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            {t.logout}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="donations">
              {t.donations} ({donations.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              {t.requests} ({requests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {t.noDonationsFound}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => {
                  const photos = parsePhotoUrls(donation.photoUrls);
                  
                  return (
                    <Card key={donation.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{donation.itemName}</CardTitle>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{donation.category}</Badge>
                              <Badge variant="outline">{donation.condition}</Badge>
                              <Badge variant="outline">{donation.donationType}</Badge>
                              <Badge className={getStatusColor(donation.status)}>
                                {donation.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>ID: #{donation.id}</p>
                            <p>{format(new Date(donation.createdAt), "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">{t.donorInformation}</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">{t.name}:</span>{" "}
                                {donation.donorName}
                              </p>
                              <p>
                                <span className="text-muted-foreground">{t.contact}:</span>{" "}
                                {donation.contactNumber}
                              </p>
                              {donation.contactEmail && (
                                <p>
                                  <span className="text-muted-foreground">{t.email}:</span>{" "}
                                  {donation.contactEmail}
                                </p>
                              )}
                              {donation.contactPhone && (
                                <p>
                                  <span className="text-muted-foreground">{t.phone}:</span>{" "}
                                  {donation.contactPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">{t.location}</h4>
                            <p className="text-sm">{donation.location}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">{t.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {donation.description}
                          </p>
                        </div>
                        {photos.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">{t.photosLabel}</h4>
                            <div className="flex gap-2 flex-wrap">
                              {photos.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`${donation.itemName} ${index + 1}`}
                                  className="h-20 w-20 object-cover rounded border"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!isLoading && donations.length > 0 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                {t.showing} {donations.length} {t.donation}{donations.length !== 1 ? "s" : ""}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {t.noRequestsFound}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{request.ngoName}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <Badge variant="outline">{t.donationId}: #{request.donationId}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{t.requestId}: #{request.id}</p>
                          <p>{format(new Date(request.createdAt), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-2">{t.requesterInformation}</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">{t.name}:</span>{" "}
                              {request.requesterName}
                            </p>
                            <p>
                              <span className="text-muted-foreground">{t.email}:</span>{" "}
                              {request.requesterEmail}
                            </p>
                            <p>
                              <span className="text-muted-foreground">{t.contact}:</span>{" "}
                              {request.requesterContact}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">{t.ngoInformation}</h4>
                          <p className="text-sm">
                            <span className="text-muted-foreground">{t.ngoName}:</span>{" "}
                            {request.ngoName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">{t.purpose}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.purpose}
                        </p>
                      </div>
                      {request.message && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">{t.additionalMessage}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.message}
                          </p>
                        </div>
                      )}
                      {request.status === "pending" && (
                        <div className="mt-6 flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(request.id, "approved", request.donationId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t.approveRequest}
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(request.id, "rejected", request.donationId)}
                            variant="destructive"
                          >
                            {t.rejectRequest}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && requests.length > 0 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                {t.showing} {requests.length} {t.request}{requests.length !== 1 ? "s" : ""}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}