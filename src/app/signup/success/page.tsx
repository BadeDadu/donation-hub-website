"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Heart, HandHeart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";

export default function SignupSuccessPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if accessed directly without signup
    const signupCompleted = sessionStorage.getItem("signup_completed");
    if (!signupCompleted) {
      router.push("/login");
    } else {
      // Clear the flag after reading it
      sessionStorage.removeItem("signup_completed");
    }
  }, [router]);

  const handleActionClick = (path: string) => {
    // Navigate to the actual destination since user is now authenticated
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">
            {language === "en" 
              ? "Account Created Successfully!" 
              : "खाता सफलतापूर्वक बनाया गया!"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Welcome to DaanSetu! You can now start making a difference in your community."
              : "दानसेतु में आपका स्वागत है! अब आप अपने समुदाय में बदलाव लाना शुरू कर सकते हैं।"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Heart className="h-5 w-5" />
                </div>
                <CardTitle>
                  {language === "en" ? "Donate Items" : "वस्तुएं दान करें"}
                </CardTitle>
              </div>
              <CardDescription>
                {language === "en"
                  ? "Share what you no longer need with those who do"
                  : "जो आपको अब जरूरत नहीं है उसे जरूरतमंदों के साथ साझा करें"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleActionClick("/donate")} 
                className="w-full" 
                size="lg"
              >
                {language === "en" ? "Start Donating" : "दान करना शुरू करें"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <HandHeart className="h-5 w-5" />
                </div>
                <CardTitle>
                  {language === "en" ? "Request Items" : "वस्तुएं अनुरोध करें"}
                </CardTitle>
              </div>
              <CardDescription>
                {language === "en"
                  ? "Let the community know what you need"
                  : "समुदाय को बताएं कि आपको क्या चाहिए"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleActionClick("/request")} 
                className="w-full" 
                size="lg" 
                variant="outline"
              >
                {language === "en" ? "Make a Request" : "अनुरोध करें"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button 
            onClick={() => handleActionClick("/")} 
            variant="ghost"
          >
            {language === "en" ? "Explore Platform" : "प्लेटफ़ॉर्म एक्सप्लोर करें"}
          </Button>
        </div>
      </div>
    </div>
  );
}