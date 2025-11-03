"use client";

import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

export default function AboutPage() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t.aboutTitle}</h1>
      <p className="mt-4 text-muted-foreground">
        {t.aboutDescription}
      </p>
      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-xl font-medium">{t.howItWorksTitle}</h2>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-muted-foreground">
            <li>{t.howItWorksStep1}</li>
            <li>{t.howItWorksStep2}</li>
            <li>{t.howItWorksStep3}</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-medium">{t.contactTitle}</h2>
          <p className="text-muted-foreground">{t.contactDescription} <a className="underline" href="mailto:donate@daansetu@gmail.com">donate@daansetu@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}