import { Suspense } from "react";
import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return {
    title: dict.meta.verifyEmailTitle,
    description: dict.meta.verifyEmailDescription,
  };
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-24 animate-pulse rounded-lg bg-muted" role="status" />
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
