import { Suspense } from "react";
import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return {
    title: dict.meta.resetPasswordTitle,
    description: dict.meta.resetPasswordDescription,
  };
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-24 animate-pulse rounded-lg bg-muted" role="status" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
