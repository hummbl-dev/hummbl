/**
 * Authentication Utilities Tests
 * 
 * @module workers/lib/auth.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractBearerToken,
  verifyToken,
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
  type User,
} from './auth';

// Mock D1 database
const createMockDB = () => {
  const mockData: Record<string, any> = {};
  
  return {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...args: any[]) => ({
        first: vi.fn(async () => {
          // Simulate session query
          if (sql.includes('sessions')) {
            const token = args[0];
            const session = mockData[`session:${token}`];
            if (session && session.expiresAt > args[1]) {
              return session;
            }
            return null;
          }
          return null;
        }),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      })),
    })),
  } as unknown as D1Database;
};

describe('extractBearerToken', () => {
  it('should extract token from valid Bearer header', () => {
    const token = extractBearerToken('Bearer abc123xyz');
    expect(token).toBe('abc123xyz');
  });

  it('should return null for missing header', () => {
    const token = extractBearerToken(null);
    expect(token).toBeNull();
  });

  it('should return null for non-Bearer header', () => {
    const token = extractBearerToken('Basic abc123');
    expect(token).toBeNull();
  });

  it('should handle Bearer with no token', () => {
    const token = extractBearerToken('Bearer ');
    expect(token).toBe('');
  });
});

describe('hashPassword', () => {
  it('should hash password consistently', async () => {
    const password = 'test123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 32 bytes = 64 hex chars
  });

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1');
    const hash2 = await hashPassword('password2');
    
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('should verify correct password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const valid = await verifyPassword(password, hash);
    
    expect(valid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('correct');
    const valid = await verifyPassword('wrong', hash);
    
    expect(valid).toBe(false);
  });
});

describe('verifyToken', () => {
  it('should return null for invalid token', async () => {
    const db = createMockDB();
    const user = await verifyToken('invalid', db);
    
    expect(user).toBeNull();
  });

  it('should return null for expired token', async () => {
    const db = createMockDB();
    const now = Math.floor(Date.now() / 1000);
    
    // Mock expired session
    const mockSession = {
      userId: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      is_active: true,
      expiresAt: now - 3600, // Expired 1 hour ago
    };
    
    (db.prepare as any).mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(null), // Expired session returns null from query
      }),
    });
    
    const user = await verifyToken('expired-token', db);
    expect(user).toBeNull();
  });

  it('should return user for valid token', async () => {
    const db = createMockDB();
    const now = Math.floor(Date.now() / 1000);
    
    const mockSession = {
      userId: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const,
      is_active: true,
      expiresAt: now + 3600, // Expires in 1 hour
    };
    
    (db.prepare as any).mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(mockSession),
      }),
    });
    
    const user = await verifyToken('valid-token', db);
    
    expect(user).not.toBeNull();
    expect(user?.id).toBe('user123');
    expect(user?.email).toBe('test@example.com');
    expect(user?.role).toBe('user');
  });

  it('should reject inactive user', async () => {
    const db = createMockDB();
    const now = Math.floor(Date.now() / 1000);
    
    const mockSession = {
      userId: 'user123',
      email: 'inactive@example.com',
      name: 'Inactive User',
      role: 'user' as const,
      is_active: false, // Inactive user
      expiresAt: now + 3600,
    };
    
    (db.prepare as any).mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(mockSession),
      }),
    });
    
    const user = await verifyToken('inactive-token', db);
    expect(user).toBeNull();
  });
});

describe('createSession', () => {
  it('should create session with token', async () => {
    const db = createMockDB();
    const token = await createSession('user123', db);
    
    expect(token).toBeDefined();
    expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(db.prepare).toHaveBeenCalled();
  });

  it('should use custom TTL', async () => {
    const db = createMockDB();
    const customTTL = 3600; // 1 hour
    const token = await createSession('user123', db, customTTL);
    
    expect(token).toBeDefined();
    expect(db.prepare).toHaveBeenCalled();
  });
});

describe('deleteSession', () => {
  it('should delete session by token', async () => {
    const db = createMockDB();
    await deleteSession('token123', db);
    
    expect(db.prepare).toHaveBeenCalled();
  });
});
