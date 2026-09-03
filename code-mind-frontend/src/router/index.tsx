import { createBrowserRouter, redirect } from "react-router";
import { RootProvider } from "@/components/providers/root-provider";
import { LoginPage } from "@/pages/login-page";
import { AuthCallbackPage } from "@/pages/auth-callback-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { OverviewPage } from "@/pages/overview-page";
import { SettingsPage } from "@/pages/settings-page";
import { ChatPage } from "@/pages/chat-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootProvider,
    children: [
      {
        index: true,
        loader: () => redirect("/dashboard"),
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "auth/callback",
        Component: AuthCallbackPage,
      },
      // Backend redirect typo handler: Spring Boot SecurityConfig redirects to /auth/callbacl
      {
        path: "auth/callbacl",
        Component: AuthCallbackPage,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "dashboard/overview",
        Component: OverviewPage,
      },
      {
        path: "dashboard/settings",
        Component: SettingsPage,
      },
      {
        path: "chat/:repoId",
        Component: ChatPage,
      },
    ],
  },
]);
