import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { LogOut, Settings, LayoutDashboard, Sparkles } from "lucide-react";
import hoverintent from "hoverintent";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

export function UserNav() {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = hoverintent(
      el,
      () => setIsOpen(true),
      () => setIsOpen(false)
    ).options({
      sensitivity: 7,
      interval: 100,
      timeout: 250, // Keep card open briefly so user can mouse over the logout button
    });

    return () => {
      instance.remove();
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <ModeToggle />

      {/* HoverIntent Avatar Container */}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-transform hover:scale-105 block"
          title="Click to view Profile & Settings"
        >
          <Avatar className="h-9 w-9 border border-border/80 shadow-xs">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
            <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
              {getInitials(user?.displayName || user?.githubUsername)}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Floating Hover Card */}
        {isOpen && (
          <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-xl p-2.5 space-y-1.5 animate-in fade-in-0 zoom-in-95 duration-100">
            {/* User Identity Header */}
            <div className="flex items-center gap-2.5 p-1.5 border-b border-border/60 pb-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName || "User"} />
                <AvatarFallback className="text-[11px]">
                  {getInitials(user?.displayName || user?.githubUsername)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.displayName || "CodeMind User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  @{user?.githubUsername || "user"}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-0.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/settings");
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground/90 hover:text-foreground transition-colors cursor-pointer text-left"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Profile & Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/overview");
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground/90 hover:text-foreground transition-colors cursor-pointer text-left"
              >
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-muted text-foreground/90 hover:text-foreground transition-colors cursor-pointer text-left"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Repositories</span>
              </button>
            </div>

            {/* Logout Action */}
            <div className="border-t border-border/60 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-medium text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}