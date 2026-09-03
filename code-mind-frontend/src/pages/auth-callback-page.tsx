import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { data: user, isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!isFetched || isLoading) return;

    if (user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate("/login?error=session", { replace: true });
  }, [user, isLoading, isFetched, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm text-muted-foreground">Finishing GitHub sign-in…</p>
    </div>
  );
}
