import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStripe } from '@/lib/stripe'

// Stripeモジュールのモック
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({
    redirectToCheckout: vi.fn(),
    elements: vi.fn(),
    confirmPayment: vi.fn(),
  })
}))

// 環境変数のモック
vi.mock('@/utils/env', () => ({
  ENV: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key'
  }
}))

describe('Stripe Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize Stripe client with publishable key', async () => {
    const stripe = await getStripe()
    
    expect(stripe).toBeDefined()
    expect(stripe).toHaveProperty('redirectToCheckout')
    expect(stripe).toHaveProperty('elements')
  })

  it('should reuse the same Stripe instance on multiple calls', async () => {
    const stripe1 = await getStripe()
    const stripe2 = await getStripe()
    
    expect(stripe1).toBe(stripe2)
  })

  it('should handle missing publishable key gracefully', async () => {
    // 環境変数を一時的に削除
    vi.doMock('@/utils/env', () => ({
      ENV: {
        STRIPE_PUBLISHABLE_KEY: ''
      }
    }))

    const stripe = await getStripe()
    expect(stripe).toBeNull()
  })
})