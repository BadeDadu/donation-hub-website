"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (!name || name.trim().length < 2) {
        setError("Please enter your full name");
        setIsLoading(false);
        return;
      }

      // Validate Indian phone number (10 digits, optionally with +91 or 91 prefix)
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      const cleanedNumber = contactNumber.replace(/\s+/g, "");
      
      if (!phoneRegex.test(cleanedNumber)) {
        setError("Please enter a valid Indian phone number (10 digits starting with 6-9)");
        setIsLoading(false);
        return;
      }

      // Store registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
      
      // Check if email already exists
      if (registeredUsers.some((user: any) => user.email === email)) {
        setError("This email is already registered. Please login instead.");
        setIsLoading(false);
        return;
      }

      const newUser = { email, name, contactNumber: cleanedNumber };
      registeredUsers.push(newUser);
      localStorage.setItem("registered_users", JSON.stringify(registeredUsers));

      // Set current user session
      localStorage.setItem("user_authenticated", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", name);
      localStorage.setItem("user_contact", cleanedNumber);

      // Set signup completion flag for success page
      sessionStorage.setItem("signup_completed", "true");

      router.push("/signup/success");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create a new account to get started (India only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}