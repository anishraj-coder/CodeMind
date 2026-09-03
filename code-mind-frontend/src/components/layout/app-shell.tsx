import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideHeader?: boolean;
}

export function AppShell({ children, title, description, hideHeader }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <Header title={title} description={description} hideHeader={hideHeader} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
