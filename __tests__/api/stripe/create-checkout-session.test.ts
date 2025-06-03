import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/stripe/create-checkout-session/route'
import { NextRequest } from 'next/server'

// Stripeモジュールのモック
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn()
    }
  }
}

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}))

// 環境変数モック
vi.mock('@/utils/env', () => ({
  SERVER_ENV: {
    STRIPE_SECRET_KEY: 'sk_test_mock'
  }
}))

// getAppUrlモック
vi.mock('@/utils/env-helpers', () => ({
  getAppUrl: () => 'https://qlink-project.vercel.app'
}))

describe('POST /api/stripe/create-checkout-session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create checkout session for monthly plan with card payment', async () => {
    const mockSessionId = 'cs_test_123'
    const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_123'

    mockStripe.checkout.sessions.create.mockResolvedValueOnce({
      id: mockSessionId,
      url: mockSessionUrl
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planType: 'monthly',
        paymentMethod: 'card',
        userId: 'user-123',
        userEmail: 'test@example.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe(mockSessionId)
    expect(data.url).toBe(mockSessionUrl)

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'Qlink プレミアムプラン（月額）',
            description: '無制限の質問作成、画像アップロード、広告なし'
          },
          unit_amount: 400,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: 'https://qlink-project.vercel.app/premium/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://qlink-project.vercel.app/premium',
      metadata: {
        userId: 'user-123',
        planType: 'monthly'
      },
      customer_email: 'test@example.com'
    })
  })

  it('should create checkout session for semi-annual plan', async () => {
    const mockSessionId = 'cs_test_456'
    const mockSessionUrl = 'https://checkout.stripe.com/pay/cs_test_456'

    mockStripe.checkout.sessions.create.mockResolvedValueOnce({
      id: mockSessionId,
      url: mockSessionUrl
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planType: 'semi-annual',
        paymentMethod: 'card',
        userId: 'user-456',
        userEmail: 'premium@example.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessionId).toBe(mockSessionId)
    
    // 半年プランの価格確認（300円×6ヶ月 = 1800円）
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'Qlink プレミアムプラン（半年）',
              description: '無制限の質問作成、画像アップロード、広告なし（実質月額300円）'
            },
            unit_amount: 1800,
            recurring: {
              interval: 'month',
              interval_count: 6
            }
          },
          quantity: 1
        }]
      })
    )
  })

  it('should support konbini payment method', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValueOnce({
      id: 'cs_test_789',
      url: 'https://checkout.stripe.com/pay/cs_test_789'
    })

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planType: 'monthly',
        paymentMethod: 'konbini',
        userId: 'user-789',
        userEmail: 'konbini@example.com'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method_types: ['konbini']
      })
    )
  })

  it('should handle invalid plan type', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planType: 'invalid',
        paymentMethod: 'card',
        userId: 'user-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid plan type')
  })

  it('should handle Stripe API errors', async () => {
    mockStripe.checkout.sessions.create.mockRejectedValueOnce(
      new Error('Stripe API error')
    )

    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        planType: 'monthly',
        paymentMethod: 'card',
        userId: 'user-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create checkout session')
  })

  it('should handle missing request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })
})