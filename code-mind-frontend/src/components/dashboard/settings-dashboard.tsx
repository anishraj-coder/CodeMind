import { useCurrentUser } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

export function SettingsDashboard() {
  const { data: user } = useCurrentUser();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage account profile, appearance, and AI model configurations.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="ai">AI Model</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Profile</CardTitle>
              <CardDescription>
                Information synced from your GitHub authentication session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user?.displayName || "Developer"}</h3>
                  <p className="text-sm text-muted-foreground">@{user?.githubUsername || "username"}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {user?.githubId || "N/A"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" defaultValue={user?.displayName || ""} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="github-username">GitHub Username</Label>
                  <Input id="github-username" defaultValue={user?.githubUsername || ""} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Interface</CardTitle>
              <CardDescription>
                Customize how CodeMind workspace looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Color Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between Light and Dark themes.
                  </p>
                </div>
                <ModeToggle />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact Chat Layout</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce padding and message spacing in chat view.
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG & AI Configuration</CardTitle>
              <CardDescription>
                Configure vector retrieval parameters and model options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="max-chunks">Max Code Snippet Chunks</Label>
                <Input id="max-chunks" type="number" defaultValue={5} min={1} max={10} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Stream Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Stream AI answers character by character.
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
