# Supabase認証設定ガイド

## 重要: 本番環境での認証設定

Vercelデプロイ後、認証がlocalhost:3000にリダイレクトされる問題を解決するため、以下の設定を行ってください。

## 1. Supabaseダッシュボードでの設定

[Supabaseダッシュボード](https://supabase.com/dashboard/project/gahupdnnjeyfgmgbkhus/auth/url-configuration)にアクセスして、以下を設定：

### Site URL
```
https://qlink-project.vercel.app
```

### Redirect URLs（すべて追加）
```
http://localhost:3000/auth/callback
https://qlink-project.vercel.app/auth/callback
https://qlink-project-*.vercel.app/auth/callback
https://*.vercel.app/auth/callback
```

## 2. OAuth設定（使用する場合）

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com/)で設定
2. 承認済みのリダイレクトURI:
   - `https://gahupdnnjeyfgmgbkhus.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

### Twitter/X OAuth
1. [Twitter Developer Portal](https://developer.twitter.com/)で設定
2. Callback URLs:
   - `https://gahupdnnjeyfgmgbkhus.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

## 3. Vercel環境変数

Vercelダッシュボードで以下の環境変数を設定：

```
NEXT_PUBLIC_SITE_URL=https://qlink-project.vercel.app
NEXTAUTH_URL=https://qlink-project.vercel.app
```

## 4. テスト方法

1. ブラウザのプライベートモードで https://qlink-project.vercel.app/login にアクセス
2. メールアドレスでサインアップまたはログイン
3. 正しくリダイレクトされることを確認

## トラブルシューティング

### 認証後localhost:3000にリダイレクトされる場合
1. Supabaseダッシュボードの設定を再確認
2. ブラウザのキャッシュをクリア
3. Vercelの環境変数が正しく設定されているか確認

### "redirect_uri_mismatch"エラーが出る場合
1. OAuth設定のリダイレクトURIを確認
2. HTTPSとHTTPの違いに注意