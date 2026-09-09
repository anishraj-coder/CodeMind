import { createBrowserRouter, redirect } from "react-router";
import { RootProvider } from "@/components/providers/root-provider";
import { RouteErrorFallback } from "@/components/error-boundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootProvider,
    errorElement: <RouteErrorFallback />,
    children: [
      {
        index: true,
        loader: () => redirect("/dashboard"),
      },
      {
        path: "login",
        lazy: async () => {
          const { LoginPage } = await import("@/pages/login-page");
          return { Component: LoginPage };
        },
      },
      {
        path: "auth/callback",
        lazy: async () => {
          const { AuthCallbackPage } = await import("@/pages/auth-callback-page");
          return { Component: AuthCallbackPage };
        },
      },
      {
        path: "auth/callbacl",
        lazy: async () => {
          const { AuthCallbackPage } = await import("@/pages/auth-callback-page");
          return { Component: AuthCallbackPage };
        },
      },
      {
        path: "dashboard",
        lazy: async () => {
          const { DashboardPage } = await import("@/pages/dashboard-page");
          return { Component: DashboardPage };
        },
      },
      {
        path: "dashboard/overview",
        lazy: async () => {
          const { OverviewPage } = await import("@/pages/overview-page");
          return { Component: OverviewPage };
        },
      },
      {
        path: "dashboard/settings",
        lazy: async () => {
          const { SettingsPage } = await import("@/pages/settings-page");
          return { Component: SettingsPage };
        },
      },
      {
        path: "dashboard/profile",
        lazy: async () => {
          const { SettingsPage } = await import("@/pages/settings-page");
          return { Component: SettingsPage };
        },
      },
      {
        path: "chat/:repoId",
        lazy: async () => {
          const { ChatPage } = await import("@/pages/chat-page");
          return { Component: ChatPage };
        },
      },
    ],
  },
]);

