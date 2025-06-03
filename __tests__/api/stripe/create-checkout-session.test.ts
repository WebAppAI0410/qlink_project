import { describe, it, expect, vi, beforeEach } from 'vitest'

// 簡化されたStripe Checkout Session APIテスト
describe('Stripe Checkout Session API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should exist and be importable', async () => {
    // APIルートファイルが存在し、インポート可能であることを確認
    const module = await import('@/app/api/stripe/create-checkout-session/route')
    expect(module.POST).toBeDefined()
    expect(typeof module.POST).toBe('function')
  })

  it('should handle missing environment variables gracefully', async () => {
    // 環境変数が設定されていない場合のエラーハンドリングを確認
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        planId: 'test-plan',
        billingCycle: 'monthly',
        paymentMethod: 'card'
      })
    } as any

    // 環境変数をクリア
    vi.stubEnv('STRIPE_SECRET_KEY', '')
    
    const { POST } = await import('@/app/api/stripe/create-checkout-session/route')
    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Stripe APIキーが設定されていません')
  })
})