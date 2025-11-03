"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function RequestFormPage() {
  const [formData, setFormData] = useState({
    ngoName: "",
    purpose: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonationId, setSelectedDonationId] = useState<string>("");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const donationIdParam = searchParams.get("donationId");

  // User details from localStorage
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");

  useEffect(() => {
    // Check authentication - use the same key as signup
    const authenticated = localStorage.getItem("user_authenticated");
    if (authenticated !== "true") {
      router.push("/login");
      return;
    }

    // Get user details
    setUserName(localStorage.getItem("user_name") || "");
    setUserEmail(localStorage.getItem("user_email") || "");
    setUserContact(localStorage.getItem("user_contact") || "");

    // Fetch available donations
    fetchDonations();
  }, [router]);

  useEffect(() => {
    if (donationIdParam) {
      setSelectedDonationId(donationIdParam);
    }
  }, [donationIdParam]);

  useEffect(() => {
    if (selectedDonationId && donations.length > 0) {
      const donation = donations.find(d => d.id === parseInt(selectedDonationId));
      setSelectedDonation(donation || null);
    }
  }, [selectedDonationId, donations]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/donations?limit=100&status=available");
      if (!response.ok) throw new Error("Failed to fetch donations");
      const data = await response.json();
      setDonations(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load available donations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation
    if (!selectedDonationId) {
      setError("Please select a donation item");
      setIsSubmitting(false);
      return;
    }

    if (!formData.ngoName || formData.ngoName.length < 2) {
      setError("Please enter your NGO name (at least 2 characters)");
      setIsSubmitting(false);
      return;
    }

    if (!formData.purpose || formData.purpose.length < 10) {
      setError("Please describe the purpose of your request (at least 10 characters)");
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit request
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donationId: parseInt(selectedDonationId),
          requesterName: userName,
          requesterEmail: userEmail,
          requesterContact: userContact,
          ngoName: formData.ngoName,
          purpose: formData.purpose,
          message: formData.message,
          status: "pending"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setSuccess(true);
      setFormData({ ngoName: "", purpose: "", message: "" });
      setSelectedDonationId("");
      
      // Redirect to browse page after 2 seconds
      setTimeout(() => {
        router.push("/browse");
      }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Request Donation Item</h1>
      </div>

      {success ? (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Request Submitted Successfully!</CardTitle>
            <CardDescription className="text-green-600">
              Your request has been submitted. The admin will review it and contact you soon.
              Redirecting to browse page...
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fill in Request Details</CardTitle>
            <CardDescription>
              Please provide information about your organization and the purpose of your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Details (Read-only) */}
              <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                <h3 className="font-medium text-sm">Your Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <div className="text-sm font-medium">{userName}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <div className="text-sm font-medium">{userEmail}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Contact Number</Label>
                    <div className="text-sm font-medium">{userContact}</div>
                  </div>
                </div>
              </div>

              {/* Select Donation Item */}
              <div className="space-y-2">
                <Label htmlFor="donation">Select Donation Item *</Label>
                <Select value={selectedDonationId} onValueChange={setSelectedDonationId}>
                  <SelectTrigger id="donation">
                    <SelectValue placeholder="Choose an item to request" />
                  </SelectTrigger>
                  <SelectContent>
                    {donations.map((donation) => (
                      <SelectItem key={donation.id} value={donation.id.toString()}>
                        {donation.itemName} - {donation.category} ({donation.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDonation && (
                  <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm">
                    <div className="font-medium">{selectedDonation.itemName}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {selectedDonation.category} • {selectedDonation.condition} • {selectedDonation.location}
                    </div>
                    {selectedDonation.description && (
                      <div className="text-muted-foreground text-xs mt-1">
                        {selectedDonation.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* NGO Name */}
              <div className="space-y-2">
                <Label htmlFor="ngoName">Name of the NGO/Organization *</Label>
                <Input
                  id="ngoName"
                  type="text"
                  placeholder="Enter your NGO or organization name"
                  value={formData.ngoName}
                  onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                  required
                />
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Request *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe why you need this item and how it will be used (minimum 10 characters)"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Additional Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Any additional information or special requirements"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/browse")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}