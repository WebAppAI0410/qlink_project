import { describe, it, expect, vi, beforeEach } from 'vitest'
import { moderateContent } from '@/utils/moderation'

// MSWを使用してAPIモックを設定
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('moderateContent', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should allow appropriate content', async () => {
    const result = await moderateContent('これは適切なコンテンツです')
    expect(result.isAppropriate).toBe(true)
    expect(result.reason).toBe('')
  })

  it('should flag inappropriate content with keywords', async () => {
    const result = await moderateContent('バカ野郎')
    expect(result.isAppropriate).toBe(false)
    expect(result.reason).toContain('不適切な表現')
  })

  it('should handle empty content', async () => {
    const result = await moderateContent('')
    expect(result.isAppropriate).toBe(false)
    expect(result.reason).toBe('回答が短すぎます')
  })

  it('should handle very long content', async () => {
    const longContent = 'あ'.repeat(10001)
    const result = await moderateContent(longContent)
    expect(result.isAppropriate).toBe(false)
    expect(result.reason).toBe('回答が長すぎます')
  })

  it('should use Perspective API when available', async () => {
    // Perspective APIのモック
    server.use(
      http.post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', () => {
        return HttpResponse.json({
          attributeScores: {
            TOXICITY: { summaryScore: { value: 0.8 } },
            SEVERE_TOXICITY: { summaryScore: { value: 0.1 } }
          }
        })
      })
    )

    process.env.PERSPECTIVE_API_KEY = 'test-key'
    const result = await moderateContent('test content')
    expect(result.isAppropriate).toBe(false)
    expect(result.confidence).toBeCloseTo(0.8)
    expect(result.severity).toBe('medium')
  })
})