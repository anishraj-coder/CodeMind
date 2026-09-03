import { FileCode, Database, RefreshCw, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface RepoSidebarProps {
  repoId: string;
}

export function RepoSidebar({ repoId }: RepoSidebarProps) {
  const indexedFiles = [
    { name: "AuthController.java", path: "src/main/java/controller/AuthController.java", vectors: 14 },
    { name: "SecurityConfig.java", path: "src/main/java/config/SecurityConfig.java", vectors: 32 },
    { name: "UserResponse.java", path: "src/main/java/dto/UserResponse.java", vectors: 8 },
    { name: "AppUser.java", path: "src/main/java/entity/AppUser.java", vectors: 12 },
    { name: "application.yml", path: "src/main/resources/application.yml", vectors: 6 },
  ];

  return (
    <div className="flex flex-col h-full border-l bg-muted/10 w-72 shrink-0 hidden lg:flex">
      <div className="p-4 border-b space-y-1">
        <h3 className="font-semibold text-sm">Indexed Structure</h3>
        <p className="text-xs text-muted-foreground">Repository #{repoId}</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-primary" /> Vector Status
              </span>
              <Badge variant="default" className="text-[10px] h-4 px-1.5">
                Ready
              </Badge>
            </div>
            <div className="text-sm font-bold">72 Vectors Indexed</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Relevant Source Files
            </div>
            <div className="space-y-1">
              {indexedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/60 text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span className="truncate font-mono">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{file.vectors} v</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-card flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Synced
        </span>
        <button className="flex items-center gap-1 hover:text-foreground">
          <RefreshCw className="h-3 w-3" /> Sync Now
        </button>
      </div>
    </div>
  );
}
