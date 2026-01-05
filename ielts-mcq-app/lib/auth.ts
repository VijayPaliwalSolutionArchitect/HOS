/**
 * Mock Authentication System
 * 
 * ============================================================
 * IMPORTANT: This is a MOCK authentication system for development.
 * Replace with NextAuth v5 for production use.
 * ============================================================
 * 
 * To implement real authentication:
 * 1. Install next-auth: yarn add next-auth@beta @auth/prisma-adapter
 * 2. Create app/api/auth/[...nextauth]/route.ts
 * 3. Configure providers (Google, Credentials)
 * 4. Replace mock functions with real NextAuth calls
 * 
 * See .env.example for required environment variables.
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ===========================================
// TYPES
// ===========================================

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  xpPoints: number;
  level: number;
  streak: number;
  targetBand: number;
  createdAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}

// ===========================================
// MOCK USER DATABASE
// ===========================================

/**
 * In-memory user store for development
 * Replace with Prisma queries in production
 */
const mockUsers: Map<string, User & { password: string }> = new Map();

// Initialize with demo users
const initMockUsers = () => {
  if (mockUsers.size === 0) {
    // Demo student user
    mockUsers.set('demo@ielts.com', {
      id: uuidv4(),
      name: 'Demo Student',
      email: 'demo@ielts.com',
      image: 'https://ui-avatars.com/api/?name=Demo+Student&background=6366f1&color=fff',
      role: 'USER',
      password: bcrypt.hashSync('demo123', 10),
      xpPoints: 1250,
      level: 5,
      streak: 7,
      targetBand: 7.5,
      createdAt: new Date(),
    });
    
    // Demo admin user
    mockUsers.set('admin@ielts.com', {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@ielts.com',
      image: 'https://ui-avatars.com/api/?name=Admin+User&background=ec4899&color=fff',
      role: 'ADMIN',
      password: bcrypt.hashSync('admin123', 10),
      xpPoints: 5000,
      level: 15,
      streak: 30,
      targetBand: 9,
      createdAt: new Date(),
    });
  }
};

// Initialize on module load
initMockUsers();

// ===========================================
// MOCK SESSION STORAGE
// ===========================================

/**
 * Session storage key for localStorage
 * In production, sessions are managed by NextAuth
 */
const SESSION_KEY = 'ielts_mcq_session';

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================

/**
 * Sign in with email and password
 * 
 * MOCK: Validates against in-memory store
 * PRODUCTION: Use NextAuth signIn() with Credentials provider
 * 
 * @param email - User email
 * @param password - User password
 * @returns Session object or null
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.get(email.toLowerCase());
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Create session (exclude password)
  const { password: _, ...userWithoutPassword } = user;
  const session: Session = {
    user: userWithoutPassword,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  
  // Store session in localStorage (client-side only)
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return { success: true, user: userWithoutPassword };
}

/**
 * Sign up with email and password
 * 
 * MOCK: Adds user to in-memory store
 * PRODUCTION: Use Prisma to create user, then NextAuth signIn()
 * 
 * @param name - User name
 * @param email - User email  
 * @param password - User password
 * @returns Created user or error
 */
export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user exists
  if (mockUsers.has(email.toLowerCase())) {
    return { success: false, error: 'Email already registered' };
  }
  
  // Create new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User & { password: string } = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    role: 'USER',
    password: hashedPassword,
    xpPoints: 0,
    level: 1,
    streak: 0,
    targetBand: 7,
    createdAt: new Date(),
  };
  
  mockUsers.set(email.toLowerCase(), newUser);
  
  // Auto sign in after registration
  const { password: _, ...userWithoutPassword } = newUser;
  const session: Session = {
    user: userWithoutPassword,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return { success: true, user: userWithoutPassword };
}

/**
 * Sign out current user
 * 
 * MOCK: Clears localStorage session
 * PRODUCTION: Use NextAuth signOut()
 */
export async function signOut(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Get current session
 * 
 * MOCK: Reads from localStorage
 * PRODUCTION: Use NextAuth getServerSession() or useSession()
 * 
 * @returns Current session or null
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    const session = JSON.parse(stored) as Session;
    
    // Check if session expired
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Get current user
 * 
 * @returns Current user or null
 */
export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if user has admin role
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

/**
 * Update user profile
 * 
 * MOCK: Updates in-memory store
 * PRODUCTION: Use Prisma to update user
 */
export async function updateProfile(
  updates: Partial<Pick<User, 'name' | 'targetBand' | 'image'>>
): Promise<{ success: boolean; user?: User }> {
  const session = getSession();
  if (!session) return { success: false };
  
  const user = mockUsers.get(session.user.email);
  if (!user) return { success: false };
  
  // Update user
  Object.assign(user, updates);
  
  // Update session
  const { password: _, ...userWithoutPassword } = user;
  session.user = userWithoutPassword;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return { success: true, user: userWithoutPassword };
}

/**
 * Add XP points to user
 * 
 * MOCK: Updates in-memory store
 * PRODUCTION: Use Prisma transaction with level calculation
 */
export async function addXP(points: number): Promise<{ newXP: number; newLevel: number }> {
  const session = getSession();
  if (!session) return { newXP: 0, newLevel: 1 };
  
  const user = mockUsers.get(session.user.email);
  if (!user) return { newXP: 0, newLevel: 1 };
  
  // Add XP
  user.xpPoints += points;
  
  // Calculate new level (simple formula: level = floor(sqrt(xp/100)) + 1)
  user.level = Math.floor(Math.sqrt(user.xpPoints / 100)) + 1;
  
  // Update session
  const { password: _, ...userWithoutPassword } = user;
  session.user = userWithoutPassword;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return { newXP: user.xpPoints, newLevel: user.level };
}
