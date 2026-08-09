import type { Metadata } from "next";
import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import { AuthForm } from "@/components/auth/auth-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  return {
    title: dict.meta.registerTitle,
    description: dict.meta.registerDescription,
  };
}

export default async function RegisterPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  return (
    <AuthForm
      mode="register"
      title={dict.auth.register.title}
      subtitle={dict.auth.register.subtitle}
      submitLabel={dict.auth.register.submit}
      fields={[
        {
          name: "displayName",
          type: "text",
          label: dict.auth.register.name,
          placeholder: dict.auth.register.namePlaceholder,
          autoComplete: "name",
        },
        {
          name: "email",
          type: "email",
          label: dict.auth.register.email,
          placeholder: dict.auth.register.emailPlaceholder,
          autoComplete: "email",
        },
        {
          name: "password",
          type: "password",
          label: dict.auth.register.password,
          placeholder: dict.auth.register.passwordPlaceholder,
          autoComplete: "new-password",
          minLength: 8,
        },
      ]}
      footer={
        <>
          {dict.auth.register.haveAccount}{" "}
          <Link
            href={localizePath(loc, "/login")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {dict.auth.register.signIn}
          </Link>
        </>
      }
    />
  );
}
