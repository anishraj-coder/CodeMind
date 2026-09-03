import { useState } from "react";
import { Link } from "react-router";
import { Search, Plus, FolderGit2, Star, GitFork, RefreshCw, MessageSquare, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Repository } from "@/types/repo";
import { cn } from "@/lib/utils";

const initialRepos: Repository[] = [
  {
    id: "1",
    name: "code-mind-backend",
    owner: "code-mind",
    description: "Spring Boot backend RAG engine with vector search and OAuth authentication",
    stars: 14,
    forks: 3,
    language: "Java",
    updatedAt: "2 hours ago",
    isPrivate: false,
    status: "indexed",
  },
  {
    id: "2",
    name: "code-mind-frontend",
    owner: "code-mind",
    description: "React Single Page Application built with Vite, Tailwind CSS, and Shadcn UI",
    stars: 22,
    forks: 5,
    language: "TypeScript",
    updatedAt: "Just now",
    isPrivate: false,
    status: "indexed",
  },
  {
    id: "3",
    name: "spring-boot-starter-rag",
    owner: "code-mind",
    description: "Starter library for AI embedding generation and PostgreSQL pgvector integration",
    stars: 5,
    forks: 1,
    language: "Java",
    updatedAt: "1 day ago",
    isPrivate: true,
    status: "indexing",
  },
  {
    id: "4",
    name: "react-query-llm-template",
    owner: "code-mind",
    description: "Template for streaming AI chat messages with TanStack Query and SSE",
    stars: 9,
    forks: 2,
    language: "TypeScript",
    updatedAt: "3 days ago",
    isPrivate: false,
    status: "idle",
  },
];

export function RepoDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddRepo = () => {
    if (!newRepoUrl) return;
    const nameMatch = newRepoUrl.split("/").pop() || "new-repository";
    const newRepo: Repository = {
      id: String(Date.now()),
      name: nameMatch.replace(".git", ""),
      owner: "github-user",
      description: "Imported GitHub repository",
      stars: 0,
      forks: 0,
      language: "TypeScript",
      updatedAt: "Just now",
      isPrivate: false,
      status: "indexing",
    };
    setRepos([newRepo, ...repos]);
    setNewRepoUrl("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repositories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your indexed repositories and start AI code chats.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Connect Repository
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect GitHub Repository</DialogTitle>
              <DialogDescription>
                Enter the URL of a public or private GitHub repository to index for CodeMind AI chat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/owner/repository"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRepo}>Start Indexing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories by name or description..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Repos Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRepos.map((repo) => (
          <Card key={repo.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                    <Link to={`/chat/${repo.id}`} className="hover:underline text-foreground">
                      {repo.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{repo.description}</CardDescription>
                </div>
                <Badge
                  variant={
                    repo.status === "indexed"
                      ? "default"
                      : repo.status === "indexing"
                      ? "secondary"
                      : "outline"
                  }
                  className="capitalize shrink-0"
                >
                  {repo.status === "indexing" && (
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {repo.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {repo.language}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" />
                  {repo.forks}
                </span>
                <span>Updated {repo.updatedAt}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{repo.owner}</span>
              <div className="flex gap-2">
                <a
                  href={`https://github.com/${repo.owner}/${repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link
                  to={`/chat/${repo.id}`}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Start Chat
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
