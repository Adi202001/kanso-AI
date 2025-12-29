
import { api } from './api';

// Re-export type for compatibility
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * @deprecated Use api.login() from './api' instead.
 * This adapter ensures legacy calls use the Neon backend.
 */
export const login = async (email: string): Promise<AuthUser> => {
  return await api.login(email);
};

/**
 * @deprecated Use api.logout() from './api' instead.
 */
export const logout = () => {
  api.logout();
};

/**
 * @deprecated Use api.getCurrentUser() from './api' instead.
 */
export const getCurrentUser = () => {
  const stored = localStorage.getItem('ainrion_session_user');
  return stored ? JSON.parse(stored) : null;
};
