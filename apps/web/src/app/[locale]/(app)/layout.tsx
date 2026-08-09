import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AppBottomNav } from "@/components/app/app-bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <AppSidebar />
      <div className="flex min-h-dvh flex-col lg:ps-64">
        <AppTopbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-16">
          {children}
        </main>
      </div>
      <AppBottomNav />
    </div>
  );
}
