import {useState, Suspense} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Outlet} from "react-router";
import {ThemeProvider} from "@/components/theme-provider";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {ErrorBoundary} from "@/components/error-boundary";
import {PageLoader} from "@/components/ui/page-loader";

export function RootProvider() {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <ErrorBoundary>
                    <Suspense fallback={<PageLoader className="h-screen min-h-screen" />}>
                        <Outlet/>
                    </Suspense>
                </ErrorBoundary>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    );
}
