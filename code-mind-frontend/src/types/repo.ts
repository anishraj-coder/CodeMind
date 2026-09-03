export interface Repository {
  id: string;
  name: string;
  owner: string;
  description?: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  isPrivate: boolean;
  status: "indexed" | "indexing" | "failed" | "idle";
}

export interface OverviewStats {
  totalRepos: number;
  indexedRepos: number;
  totalChats: number;
  storageUsed: string;
}
