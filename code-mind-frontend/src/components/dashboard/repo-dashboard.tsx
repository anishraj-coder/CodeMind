import {useState} from "react";
import {Link} from "react-router";
import {ExternalLink, FolderGit2, MessageSquare, RefreshCw, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button, buttonVariants} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

import {cn} from "@/lib/utils";
import {useRepo, useSyncRepos} from "@/hooks/use-repo.ts";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useIndex} from "@/hooks/use-index.ts";

export function RepoDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const {isLoading, isError, data: repos} = useRepo();
    const {mutate: sync, isPending: isSyncing} = useSyncRepos();
    const {mutate: indexRepo}=useIndex();
    const syncRepos = () => {
        sync();
    };


    const filteredRepos = repos?.filter(
        (repo) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-full w-full flex items-center justify-center text-destructive">
                Error loading repos...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Repositories</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your indexed repositories and start AI code chats.
                    </p>
                </div>

                <Button onClick={syncRepos} disabled={isSyncing} className="gap-2">
                    <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")}/>
                    {isSyncing ? "Syncing..." : "Sync Repositories"}
                </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder="Search repositories by name or description..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Empty State */}
            {(!filteredRepos || filteredRepos.length === 0) && (
                <div
                    className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                    <FolderGit2 className="h-12 w-12 text-muted-foreground/50 mb-3"/>
                    <h3 className="text-lg font-semibold">No repositories found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click sync to pull your repositories directly from GitHub.
                    </p>
                    <Button onClick={syncRepos} disabled={isSyncing} variant="outline" className="gap-2">
                        <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")}/>
                        {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                </div>
            )}

            {/* Repos Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredRepos &&
                    filteredRepos.map((repo) => (
                        <Card key={repo.id}
                              className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FolderGit2 className="h-5 w-5 text-muted-foreground"/>
                                            <Link to={`/chat/${repo.id}`} className="hover:underline text-foreground">
                                                {repo.name}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {repo.description || "No description provided."}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            repo.indexStatus === "READY"
                                                ? "default"
                                                : repo.indexStatus === "INDEXING"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                        className="capitalize shrink-0"
                                    >
                                        {repo.indexStatus === "INDEXING" && (
                                            <RefreshCw className="mr-1 h-3 w-3 animate-spin"/>
                                        )}
                                        {repo.indexStatus}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    {repo.language && (
                                        <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500"/>
                                            {repo.language}
                    </span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 px-6 py-3 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">{repo.owner}</span>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://github.com/${repo.owner}/${repo.name}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={cn(buttonVariants({variant: "ghost", size: "sm"}))}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5"/>
                                    </a>
                                    <Button
                                        variant={repo.indexStatus == 'INDEXING' || repo.indexStatus == 'READY' ? 'ghost' : 'secondary'}
                                        disabled={repo.indexStatus == 'INDEXING' || repo.indexStatus == 'READY'}
                                        onClick={()=> {
                                            indexRepo(repo.id)
                                            repo.indexStatus='INDEXING'
                                        }}
                                    >
                                        Index Repo
                                    </Button>
                                    <Link
                                        to={`/chat/${repo.id}`}
                                        className={cn(buttonVariants({variant: "default", size: "sm"}))}
                                    >
                                        <MessageSquare className="mr-1.5 h-3.5 w-3.5"/> Start Chat
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
            </div>
        </div>
    );
}