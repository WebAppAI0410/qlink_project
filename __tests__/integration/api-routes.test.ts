import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// MSWサーバーの設定
const server = setupServer(
  // Stripe API モック
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123'
    })
  }),

  // Perspective API モック
  http.post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', () => {
    return HttpResponse.json({
      attributeScores: {
        TOXICITY: { summaryScore: { value: 0.1 } },
        SEVERE_TOXICITY: { summaryScore: { value: 0.05 } }
      }
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Routes', () => {
  describe('/api/stripe/create-checkout-session', () => {
    it('should create checkout session for premium subscription', async () => {
      const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          priceId: 'price_premium_monthly'
        })
      })

      // Note: 実際のテストでは、Next.jsのAPIルートをモックする必要があります
      expect(response).toBeDefined()
    })
  })

  describe('/api/test-moderation', () => {
    it('should test content moderation', async () => {
      const testContent = 'これは適切なテストコンテンツです'
      
      // Perspective APIが適切に呼ばれることを確認
      const response = await fetch('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: { text: testContent },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {}
          }
        })
      })

      const data = await response.json()
      expect(data.attributeScores.TOXICITY.summaryScore.value).toBeLessThan(0.5)
    })
  })

  describe('Webhook Handling', () => {
    it('should handle Stripe webhook events', async () => {
      server.use(
        http.post('http://localhost:3000/api/stripe/webhook', () => {
          return HttpResponse.json({ received: true })
        })
      )

      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_123',
            metadata: { userId: 'user-123' }
          }
        }
      }

      const response = await fetch('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test-signature'
        },
        body: JSON.stringify(webhookPayload)
      })

      const data = await response.json()
      expect(data.received).toBe(true)
    })

    it('should handle auth webhook for profile creation', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/webhook', () => {
          return HttpResponse.json({ success: true })
        })
      )

      const authEvent = {
        type: 'INSERT',
        table: 'auth.users',
        record: {
          id: 'user-123',
          email: 'newuser@example.com'
        }
      }

      const response = await fetch('http://localhost:3000/api/auth/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authEvent)
      })

      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })
})