import jwtDecode from 'jwt-decode';

export type JwtPayload = {
  sub: string;
  roles?: string[];
  exp?: number;
};

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getCurrentUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    // Decode JWT token
    if (!token) return null;
    return jwtDecode<JwtPayload>(token);
  } catch (e) {
    return null;
  }
}

export function hasRole(role: string) {
  const user = getCurrentUser();
  return !!(user && user.roles && user.roles.includes(role));
}

export type MappedUser = { id: string; email: string; roles: string[]; name?: string };

export function mapPayloadToUser(payload: JwtPayload | null): MappedUser | null {
  if (!payload) return null;
  const p = payload as unknown as { sub?: string; id?: string; email?: string; roles?: string[]; name?: string };
  return {
    id: p.sub || p.id || '',
    email: p.email || '',
    roles: p.roles || [],
    name: p.name || undefined,
  };
}
