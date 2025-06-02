import { vi } from 'vitest'

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null })
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
  })),
  storage: {
    from: vi.fn((bucket: string) => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/image.jpg' } })
    }))
  }
})

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockProfile = {
  id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  is_premium: false,
  auth_source: 'email',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockQuestion = {
  id: 'test-question-id',
  user_id: 'test-user-id',
  content: 'Test question content',
  short_id: 'abc123',
  is_open: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockAnswer = {
  id: 'test-answer-id',
  question_id: 'test-question-id',
  content: 'Test answer content',
  is_appropriate: true,
  created_at: new Date().toISOString()
}