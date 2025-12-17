import { hasRole, hasAnyRole, buildAuthorizationURL } from '@/lib/auth';
import { User } from '@/lib/types';

describe('Auth Utilities', () => {
  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['USER', 'STUDENT'],
    authorities: ['USER', 'STUDENT'],
  };

  describe('hasRole', () => {
    it('should return true for existing role', () => {
      expect(hasRole(mockUser, 'USER')).toBe(true);
      expect(hasRole(mockUser, 'STUDENT')).toBe(true);
    });

    it('should return false for non-existing role', () => {
      expect(hasRole(mockUser, 'ADMIN')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, 'USER')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has any of the roles', () => {
      expect(hasAnyRole(mockUser, ['ADMIN', 'USER'])).toBe(true);
    });

    it('should return false if user has none of the roles', () => {
      expect(hasAnyRole(mockUser, ['ADMIN', 'TEACHER'])).toBe(false);
    });
  });

  describe('buildAuthorizationURL', () => {
    it('should build correct authorization URL', () => {
      const url = buildAuthorizationURL(
        'http://localhost:8080',
        'client-id',
        'http://localhost:3000/callback',
        'openid profile email',
        'challenge',
        'state123'
      );

      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=client-id');
      expect(url).toContain('code_challenge=challenge');
      expect(url).toContain('state=state123');
    });
  });
});
