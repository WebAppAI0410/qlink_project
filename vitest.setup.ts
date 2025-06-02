import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// テスト後のクリーンアップ
afterEach(() => {
  cleanup()
})

// Next.js Imageコンポーネントのモック
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation((props) => {
    return JSON.stringify(props)
  })
}))

// Next.js Linkコンポーネントのモック
vi.mock('next/link', () => ({
  default: vi.fn().mockImplementation(({ children, href }) => {
    return children
  })
}))

// Next.js navigationのモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn()
  }),
  usePathname: () => '/',
  useParams: () => ({})
}))

// Supabaseクライアントのモック
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    }))
  })
}))

// 環境変数のモック
vi.mock('@/utils/env', () => ({
  getEnvConfig: vi.fn().mockResolvedValue({
    stripe: {
      publishableKey: 'pk_test_123',
      secretKey: 'sk_test_123'
    },
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key'
    }
  })
}))