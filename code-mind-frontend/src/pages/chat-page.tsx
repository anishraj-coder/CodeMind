import { useParams } from "react-router";
import { ChatView } from "@/components/chat/chat-view";
import { RequireAuth } from "@/components/providers/require-auth";

export function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();

  return (
    <RequireAuth>
      <ChatView repoId={repoId || "default"} />
    </RequireAuth>
  );
}
