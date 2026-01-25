/**
 * Mock Authentication System
 * Handles role-based authentication using localStorage
 * Roles: student | admin | super-admin
 */

export type UserRole = 'student' | 'admin' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
}

// Mock user data
const mockUsers: Record<UserRole, User> = {
  student: {
    id: 'student-001',
    name: 'John Student',
    email: 'student@placement.edu',
    role: 'student',
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'admin-001',
    name: 'Sarah TPO',
    email: 'admin@placement.edu',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  'super-admin': {
    id: 'super-001',
    name: 'Alex Director',
    email: 'director@placement.edu',
    role: 'super-admin',
    createdAt: new Date().toISOString(),
  },
};

const AUTH_STORAGE_KEY = 'placement_auth_session';

/**
 * Login user with specified role
 */
export const login = (role: UserRole): AuthSession => {
  const user = mockUsers[role];
  const session: AuthSession = {
    user,
    isAuthenticated: true,
  };
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
};

/**
 * Logout current user
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

/**
 * Get current session from localStorage
 */
export const getSession = (): AuthSession | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const session = getSession();
  return session?.isAuthenticated ?? false;
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const session = getSession();
  return session?.user ?? null;
};

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRole: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    student: 'Student',
    admin: 'Admin (TPO)',
    'super-admin': 'Super Admin',
  };
  return names[role];
};
