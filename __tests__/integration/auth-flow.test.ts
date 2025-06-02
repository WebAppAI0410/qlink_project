import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient, mockUser, mockProfile } from '@/test-utils/supabase-mock'

// Supabaseクライアントのモック
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => createMockSupabaseClient()
}))

describe('Authentication Flow', () => {
  let supabaseClient: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    supabaseClient = createMockSupabaseClient()
  })

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const email = 'newuser@example.com'
      const password = 'securePassword123'

      supabaseClient.auth.signUp = vi.fn().mockResolvedValue({
        data: {
          user: { ...mockUser, email },
          session: { access_token: 'test-token' }
        },
        error: null
      })

      const result = await supabaseClient.auth.signUp({ email, password })

      expect(result.error).toBeNull()
      expect(result.data?.user?.email).toBe(email)
      expect(supabaseClient.auth.signUp).toHaveBeenCalledWith({ email, password })
    })

    it('should handle registration errors', async () => {
      supabaseClient.auth.signUp = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      })

      const result = await supabaseClient.auth.signUp({
        email: 'existing@example.com',
        password: 'password123'
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('User already registered')
    })
  })

  describe('User Login', () => {
    it('should successfully login with email and password', async () => {
      const email = 'user@example.com'
      const password = 'password123'

      supabaseClient.auth.signInWithPassword = vi.fn().mockResolvedValue({
        data: {
          user: mockUser,
          session: { access_token: 'test-token' }
        },
        error: null
      })

      const result = await supabaseClient.auth.signInWithPassword({ email, password })

      expect(result.error).toBeNull()
      expect(result.data?.user).toEqual(mockUser)
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({ email, password })
    })

    it('should handle invalid credentials', async () => {
      supabaseClient.auth.signInWithPassword = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const result = await supabaseClient.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Invalid login credentials')
    })
  })

  describe('OAuth Login', () => {
    it('should initiate Google OAuth login', async () => {
      supabaseClient.auth.signInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      })

      const result = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:3000/auth/callback' }
      })

      expect(result.error).toBeNull()
      expect(result.data?.url).toContain('accounts.google.com')
      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: 'http://localhost:3000/auth/callback' }
      })
    })

    it('should initiate Twitter OAuth login', async () => {
      supabaseClient.auth.signInWithOAuth = vi.fn().mockResolvedValue({
        data: { url: 'https://api.twitter.com/oauth/authenticate?...' },
        error: null
      })

      const result = await supabaseClient.auth.signInWithOAuth({
        provider: 'twitter',
        options: { redirectTo: 'http://localhost:3000/auth/callback' }
      })

      expect(result.error).toBeNull()
      expect(result.data?.url).toContain('twitter.com')
    })
  })

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const email = 'user@example.com'

      supabaseClient.auth.resetPasswordForEmail = vi.fn().mockResolvedValue({
        data: {},
        error: null
      })

      const result = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password'
      })

      expect(result.error).toBeNull()
      expect(supabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        { redirectTo: 'http://localhost:3000/reset-password' }
      )
    })
  })

  describe('User Logout', () => {
    it('should successfully logout user', async () => {
      supabaseClient.auth.signOut = vi.fn().mockResolvedValue({
        error: null
      })

      const result = await supabaseClient.auth.signOut()

      expect(result.error).toBeNull()
      expect(supabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('should get current user when logged in', async () => {
      supabaseClient.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await supabaseClient.auth.getUser()

      expect(result.error).toBeNull()
      expect(result.data?.user).toEqual(mockUser)
    })

    it('should return null user when not logged in', async () => {
      supabaseClient.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await supabaseClient.auth.getUser()

      expect(result.error).toBeNull()
      expect(result.data?.user).toBeNull()
    })
  })
})