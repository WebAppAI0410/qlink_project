import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePremium } from '@/lib/hooks/use-premium'
import { createMockSupabaseClient } from '@/test-utils/supabase-mock'

// Supabaseクライアントのモック
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => createMockSupabaseClient()
}))

describe('usePremium Hook', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = createMockSupabaseClient()
  })

  it('should return default state when user is not logged in', async () => {
    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: null
    })

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toBeNull()
    expect(result.current.getCharacterLimit('question')).toBe(200)
    expect(result.current.getCharacterLimit('answer')).toBe(100)
    expect(result.current.canUploadImages()).toBe(false)
    expect(result.current.canCreateUnlimitedQuestions()).toBe(false)
    expect(result.current.hasAdFreeExperience()).toBe(false)
  })

  it('should fetch premium status for logged in user', async () => {
    const mockUser = { id: 'test-user-id' }
    const mockSubscription = {
      id: 'sub_123',
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    })

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(true)
    expect(result.current.subscription).toEqual(mockSubscription)
    expect(result.current.getCharacterLimit('question')).toBe(10000)
    expect(result.current.getCharacterLimit('answer')).toBe(1000)
    expect(result.current.canUploadImages()).toBe(true)
    expect(result.current.canCreateUnlimitedQuestions()).toBe(true)
    expect(result.current.hasAdFreeExperience()).toBe(true)
  })

  it('should handle expired subscription', async () => {
    const mockUser = { id: 'test-user-id' }
    const expiredSubscription = {
      id: 'sub_123',
      status: 'active',
      current_period_end: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 昨日で期限切れ
    }

    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: expiredSubscription,
        error: null
      })
    })

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toEqual(expiredSubscription)
  })

  it('should handle database errors gracefully', async () => {
    const mockUser = { id: 'test-user-id' }

    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    })

    const { result } = renderHook(() => usePremium())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toBeNull()
  })
})