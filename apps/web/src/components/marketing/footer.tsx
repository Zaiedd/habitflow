import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import { Logo } from "@/components/ui/logo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function Footer() {
  const loc = await localeParam();
  const dict = getDictionary(loc);

  const groups = [
    { heading: dict.footer.product, links: dict.footer.productLinks },
    { heading: dict.footer.company, links: dict.footer.companyLinks },
    { heading: dict.footer.legal, links: dict.footer.legalLinks },
  ];

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-app py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {dict.footer.tagline}
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold text-foreground">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HabitFlow, Inc. {dict.footer.rights}
          </p>
          <p className="text-xs text-muted-foreground">{dict.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
