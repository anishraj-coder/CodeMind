import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  title?: string;
  description?: string;
  hideHeader?: boolean;
}

export function Header({ title, description, hideHeader }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur transition-all">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        {!hideHeader && title && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
              )}
            </div>
          </>
        )}
      </div>
      <UserNav />
    </header>
  );
}
