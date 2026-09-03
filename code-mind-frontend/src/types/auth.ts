export interface UserResponse {
  id: number;
  githubId: string;
  githubUsername: string;
  displayName: string;
  avatarUrl: string;
}

export interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isFetched: boolean;
  isError: boolean;
}
