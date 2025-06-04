import { describe, it, expect, afterEach } from 'vitest'
import { getAppUrl } from '@/utils/env-helpers'

const ORIGINAL_ENV = { ...process.env }

const originalWindow = global.window

afterEach(() => {
  Object.assign(process.env, ORIGINAL_ENV)
  if (originalWindow) {
    // restore original window if it existed
    global.window = originalWindow
  } else {
    // delete the window added during tests
    // @ts-ignore
    delete global.window
  }
})

describe('getAppUrl', () => {
  it('returns window location origin on client side', () => {
    // @ts-ignore
    global.window = { location: { origin: 'https://client.example.com' } }
    const url = getAppUrl()
    expect(url).toBe('https://client.example.com')
  })

  it('uses NEXT_PUBLIC_SITE_URL on server side', () => {
    // @ts-ignore
    delete global.window
    process.env.NEXT_PUBLIC_SITE_URL = 'https://site.example.com'
    const url = getAppUrl()
    expect(url).toBe('https://site.example.com')
  })

  it('falls back to localhost when no env vars are set', () => {
    // @ts-ignore
    delete global.window
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_URL
    delete process.env.NEXTAUTH_URL
    const url = getAppUrl()
    expect(url).toBe('http://localhost:3000')
  })
})
