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
  return {
    title: {
      default: dict.meta.defaultTitle,
      template: "%s · HabitFlow",
    },
    description: dict.meta.defaultDescription,
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
