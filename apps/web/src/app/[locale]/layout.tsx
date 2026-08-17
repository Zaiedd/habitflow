import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Lexend, Noto_Sans_Arabic } from "next/font/google";
import { locale as localeParam } from "next/root-params";
import "../globals.css";
import { locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/config";

const inter = Inter({
  variable: "--font-habitflow-sans",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-habitflow-display",
  subsets: ["latin"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-habitflow-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const loc = await localeParam();
  const dict = getDictionary(loc);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: dict.meta.defaultTitle,
      template: "%s · HabitFlow",
    },
    description: dict.meta.defaultDescription,
    manifest: `${base}/manifest.webmanifest`,
    icons: {
      icon: [
        { url: `${base}/brand/favicon.ico`, sizes: "any" },
        { url: `${base}/brand/favicon-32.jpeg`, sizes: "32x32", type: "image/jpeg" },
        { url: `${base}/brand/logo.jpeg`, type: "image/jpeg" },
      ],
      apple: [{ url: `${base}/brand/apple-touch-icon.jpeg`, sizes: "180x180", type: "image/jpeg" }],
    },
    openGraph: {
      title: dict.meta.defaultTitle,
      description: dict.meta.defaultDescription,
      type: "website",
      locale: loc,
      images: [{ url: `${base}/brand/og-image.jpeg`, width: 1200, height: 630, type: "image/jpeg" }],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("habitflow-theme");
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default async function RootLayout(
  props: LayoutProps<"/[locale]">,
) {
  const { locale: rawLocale } = await props.params;
  const loc = rawLocale as Locale;
  const dict = getDictionary(loc);
  const dir = loc === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={loc}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${lexend.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="habitflow-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={loc} dict={dict}>
          <div className="flex min-h-dvh flex-col">{props.children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
