export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor' | 'admin' | 'manager';
  tenant_id?: string;
  subscription_tier?: string;
  xp?: number;
  level?: number;
  streak?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
