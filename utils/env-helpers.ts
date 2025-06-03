/**
 * 環境変数ヘルパー
 * 本番環境、プレビュー環境、ローカル環境で適切なURLを返す
 */

export function getAppUrl(): string {
  // クライアントサイドでwindow.location.originを使用
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // サーバーサイドでの処理
  // 本番環境のURLを優先
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Vercelの環境変数を使用
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // NEXTAUTH_URLを確認
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // 開発環境のデフォルト
  return 'http://localhost:3000'
}

export function getCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`
}

export function getOgImageUrl(shortId: string): string {
  return `${getAppUrl()}/api/og/${shortId}`
}