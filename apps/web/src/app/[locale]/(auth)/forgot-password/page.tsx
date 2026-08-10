import type { Metadata } from "next";
import { locale as localeParam } from "next/root-params";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return {
    title: dict.meta.forgotPasswordTitle,
    description: dict.meta.forgotPasswordDescription,
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
