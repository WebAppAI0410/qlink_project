import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePremium, getCharacterLimit, checkPremiumFeature } from '@/lib/hooks/use-premium'

// Supabaseクライアントのモック
const mockSupabase = {
  from: vi.fn()
}

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabase
}))

describe('usePremium Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return default state when user is not logged in', async () => {
    const { result } = renderHook(() => usePremium(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toBeNull()
    expect(getCharacterLimit(false, 'question')).toBe(100)
    expect(getCharacterLimit(false, 'answer')).toBe(500)
    expect(checkPremiumFeature(false, 'analytics')).toBe(false)
    expect(checkPremiumFeature(false, 'ad_free')).toBe(false)
  })

  it('should fetch premium status for logged in user', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' } as any
    const mockSubscription = {
      id: 'sub_123',
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      premium_plan: {
        id: 'plan_123',
        name: 'プレミアム',
        price_monthly: 400,
        price_yearly: 4000,
        features: ['広告なし', '画像アップロード']
      }
    }

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    })

    const { result } = renderHook(() => usePremium(mockUser))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(true)
    expect(result.current.subscription).toEqual(mockSubscription)
    expect(getCharacterLimit(true, 'question')).toBe(1000)
    expect(getCharacterLimit(true, 'answer')).toBe(2000)
    expect(checkPremiumFeature(true, 'analytics')).toBe(true)
    expect(checkPremiumFeature(true, 'ad_free')).toBe(true)
  })

  it('should handle expired subscription', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' } as any

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // No rows found
      })
    })

    const { result } = renderHook(() => usePremium(mockUser))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toBeNull()
  })

  it('should handle database errors gracefully', async () => {
    const mockUser = { id: 'test-user-id', email: 'test@example.com' } as any

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    })

    const { result } = renderHook(() => usePremium(mockUser))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.subscription).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})