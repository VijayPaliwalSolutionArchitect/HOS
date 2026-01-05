/**
 * Auth Hook
 * 
 * React hook for accessing authentication state.
 * Uses the mock auth system (replace with NextAuth useSession in production).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Session,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  getCurrentUser,
  isAuthenticated as checkAuth,
  isAdmin as checkAdmin,
  updateProfile as authUpdateProfile,
  addXP as authAddXP,
} from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'targetBand' | 'image'>>) => Promise<boolean>;
  addXP: (points: number) => Promise<{ newXP: number; newLevel: number }>;
  refreshSession: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load session on mount
  const refreshSession = useCallback(() => {
    const currentSession = getSession();
    setSession(currentSession);
    setUser(currentSession?.user || null);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    refreshSession();
    
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ielts_mcq_session') {
        refreshSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshSession]);
  
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authSignIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setSession(getSession());
    }
    setIsLoading(false);
    return { success: result.success, error: result.error };
  }, []);
  
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const result = await authSignUp(name, email, password);
    if (result.success && result.user) {
      setUser(result.user);
      setSession(getSession());
    }
    setIsLoading(false);
    return { success: result.success, error: result.error };
  }, []);
  
  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  }, []);
  
  const updateProfile = useCallback(async (
    updates: Partial<Pick<User, 'name' | 'targetBand' | 'image'>>
  ) => {
    const result = await authUpdateProfile(updates);
    if (result.success && result.user) {
      setUser(result.user);
      setSession(getSession());
    }
    return result.success;
  }, []);
  
  const addXP = useCallback(async (points: number) => {
    const result = await authAddXP(points);
    refreshSession(); // Refresh to get updated user
    return result;
  }, [refreshSession]);
  
  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    signIn,
    signUp,
    signOut,
    updateProfile,
    addXP,
    refreshSession,
  };
}

export default useAuth;
