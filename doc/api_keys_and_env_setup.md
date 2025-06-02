# Qlink API キーおよび環境設定ガイド

このドキュメントでは、Qlinkプロジェクトを構築する際に必要なAPIキーや環境変数の設定について詳細に説明します。

## 必要なAPIキーと認証情報

### 1. Supabase設定

**必須環境変数:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**取得方法:**
1. [Supabase](https://supabase.com/)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクト設定 > API から上記キーを取得

### 2. Google OAuth認証

**必須環境変数:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**取得方法:**
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成
3. APIとサービス > 認証情報からOAuthクライアントIDを作成
4. 承認済みのリダイレクトURIに `https://your-app-url.com/auth/callback/google` を追加

### 3. Twitter/X OAuth認証

**必須環境変数:**
```
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

**取得方法:**
1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)にアクセス
2. プロジェクトとアプリを作成（Read & Writeアクセス権が必要）
3. OAuth 2.0設定でリダイレクトURLに `https://your-app-url.com/auth/callback/twitter` を追加
4. クライアントIDとシークレットを取得

### 4. SendGrid（メール送信）

**必須環境変数:**
```
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com
```

**取得方法:**
1. [SendGrid](https://sendgrid.com/)でアカウント作成
2. APIキーを生成（メール送信権限必要）
3. 送信元メールアドレスを検証

### 5. Next.js環境変数

**必須環境変数:**
```
NEXTAUTH_URL=https://your-app-url.com
NEXTAUTH_SECRET=your-random-secret-key
```

**取得方法:**
- `NEXTAUTH_SECRET`は強力なランダム文字列を生成（`openssl rand -base64 32`コマンドなど）
- 開発環境では`NEXTAUTH_URL=http://localhost:3000`

## 環境変数ファイル設定

プロジェクトルートに`.env.local`ファイルを作成し、以下のテンプレートを使用：

```bash
# サイト設定
NEXT_PUBLIC_SITE_URL=https://your-app-url.com
NEXT_PUBLIC_SITE_NAME=Qlink

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 認証設定
NEXTAUTH_URL=https://your-app-url.com
NEXTAUTH_SECRET=your-random-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# メール設定
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com

# サーバー設定
PORT=3000
NODE_ENV=development # または production
```

## デプロイ環境での設定（Vercel）

Vercelにデプロイする場合、以下の手順で環境変数を設定します：

1. Vercelダッシュボードでプロジェクトを選択
2. Settings > Environment Variables セクションに移動
3. 上記の環境変数をすべて追加
4. 必要に応じて、開発環境と本番環境で異なる値を設定

## シークレット管理のベストプラクティス

1. 本番環境のシークレットは`.env.local`ファイルにコミットしないこと
2. 全ての本番シークレットはVercelやその他のデプロイプラットフォームの環境変数として安全に保存
3. 開発用のダミーアカウントとAPIキーを使用（本番アカウントと分ける）
4. 定期的にAPIキーをローテーション（特にセキュリティイベント後）
5. 最小権限の原則に従い、APIキーには必要最小限の権限のみ付与

## 開発環境でのテスト用APIキー

開発環境では、以下のAPIキーが別途必要になることがあります：

1. **Supabaseローカルエミュレータ**
   - Supabase CLIをインストール: `npm install -g supabase`
   - ローカルでSupabaseを起動: `supabase start`
   - ローカル環境用キーを取得（コンソール出力に表示）

2. **OAuth開発用リダイレクトURI**
   - Google OAuth: `http://localhost:3000/auth/callback/google`を追加
   - Twitter OAuth: `http://localhost:3000/auth/callback/twitter`を追加

## トラブルシューティング

1. **認証エラー**
   - クライアントIDとシークレットが正しいか確認
   - リダイレクトURLが正確に設定されているか確認
   - OAuth同意画面の設定を確認

2. **Supabase接続エラー**
   - URLとキーが正しいか確認
   - プロジェクトステータスをSupabaseダッシュボードで確認

3. **メール送信エラー**
   - SendGridのAPIキー権限を確認
   - 送信元メールアドレスが検証済みか確認
   - 送信クォータに達していないか確認