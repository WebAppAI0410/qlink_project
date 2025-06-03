import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from 'vitest'
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
    expect(result.severity).toBe('low')
  })

  it('should flag inappropriate content with keywords', async () => {
    const result = await moderateContent('バカ野郎')
    expect(result.isAppropriate).toBe(false)
    expect(result.reason).toContain('Inappropriate language detected')
  })

  it('should handle empty content', async () => {
    const result = await moderateContent('')
    expect(result.isAppropriate).toBe(true)
  })

  it('should handle very long content', async () => {
    const longContent = 'あ'.repeat(10001)
    const result = await moderateContent(longContent)
    expect(result.isAppropriate).toBe(false)
    expect(result.reason).toContain('Content too long')
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

    const result = await moderateContent('test content')
    expect(result.isAppropriate).toBe(false)
    expect(result.confidence).toBeGreaterThan(0.5)
  })
})