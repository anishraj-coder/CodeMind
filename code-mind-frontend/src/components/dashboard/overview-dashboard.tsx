import { Link } from "react-router";
import { FolderGit2, MessageSquare, HardDrive, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function OverviewDashboard() {
  const stats = [
    { title: "Indexed Repositories", value: "4", total: "5 repos total", icon: FolderGit2 },
    { title: "Total AI Chats", value: "28", total: "+12 this week", icon: MessageSquare },
    { title: "Vector Index Storage", value: "1.2 GB", total: "of 5.0 GB quota", icon: HardDrive },
  ];

  const recentRepos = [
    { id: "1", name: "code-mind-backend", owner: "code-mind", status: "indexed", language: "Java", stars: 14, updatedAt: "2 hours ago" },
    { id: "2", name: "code-mind-frontend", owner: "code-mind", status: "indexed", language: "TypeScript", stars: 22, updatedAt: "Just now" },
    { id: "3", name: "spring-boot-starter-rag", owner: "code-mind", status: "indexing", language: "Java", stars: 5, updatedAt: "1 day ago" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Welcome to CodeMind <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore your codebase, ask architectural questions, and chat with your repositories in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus className="mr-2 h-4 w-4" /> Add Repository
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.total}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Repositories</CardTitle>
              <CardDescription>Quick access to your active codebases</CardDescription>
            </div>
            <Link to="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 hover:bg-muted/80 transition-colors"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/chat/${repo.id}`}
                      className="font-semibold text-sm hover:underline text-primary flex items-center gap-2"
                    >
                      <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                      {repo.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{repo.language}</span>
                      <span>•</span>
                      <span>Updated {repo.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={repo.status === "indexed" ? "default" : "secondary"}>
                      {repo.status}
                    </Badge>
                    <Link to={`/chat/${repo.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Workspace Usage</CardTitle>
            <CardDescription>Vector Database & Embedding Storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Embedding Tokens Used</span>
                <span className="font-medium">245k / 1M</span>
              </div>
              <Progress value={24.5} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vector Store Storage</span>
                <span className="font-medium">1.2 GB / 5 GB</span>
              </div>
              <Progress value={24} />
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pro Tip
              </h4>
              <p className="text-xs text-foreground">
                Connect your GitHub account to automatically index code updates when you push commits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
