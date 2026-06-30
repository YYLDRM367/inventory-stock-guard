import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { MobileNavProvider, MobileNavDrawer } from "@/components/app/mobile-nav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MobileNavProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
        </div>
      </div>
      <MobileNavDrawer />
    </MobileNavProvider>
  );
}
