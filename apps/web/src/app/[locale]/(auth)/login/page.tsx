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
    title: dict.meta.loginTitle,
    description: dict.meta.loginDescription,
  };
}

export default async function LoginPage() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  return (
    <AuthForm
      mode="login"
      title={dict.auth.login.title}
      subtitle={dict.auth.login.subtitle}
      submitLabel={dict.auth.login.submit}
      fields={[
        {
          name: "email",
          type: "email",
          label: dict.auth.login.email,
          placeholder: dict.auth.login.emailPlaceholder,
          autoComplete: "email",
        },
        {
          name: "password",
          type: "password",
          label: dict.auth.login.password,
          placeholder: dict.auth.login.passwordPlaceholder,
          autoComplete: "current-password",
        },
      ]}
      footer={
        <>
          {dict.auth.login.noAccount}{" "}
          <Link
            href={localizePath(loc, "/register")}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {dict.auth.login.createOne}
          </Link>
        </>
      }
      passwordHint={
        <Link
          href={localizePath(loc, "/forgot-password")}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {dict.auth.login.forgot}
        </Link>
      }
    />
  );
}
