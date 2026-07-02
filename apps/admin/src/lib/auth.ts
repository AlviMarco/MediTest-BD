import api from './api';

// Login function
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;

  // token ও user localStorage এ save করা
  localStorage.setItem('meditest_token', token);
  localStorage.setItem('meditest_user', JSON.stringify(user));

  return { token, user };
};

// Logout function
export const logout = () => {
  localStorage.removeItem('meditest_token');
  localStorage.removeItem('meditest_user');
  window.location.href = '/login';
};

// Current user নেওয়া
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('meditest_user');
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem('meditest_user');
    return null;
  }
};

// Token আছে কিনা check
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('meditest_token');
};

// Role check
export const hasRole = (roleId: number) => {
  const user = getCurrentUser();
  return user?.role_id === roleId;
};

// Role constants
export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MODERATOR: 3,
  USER: 4,
};
