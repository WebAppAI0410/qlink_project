# Qlink Vercelデプロイガイド

## デプロイ手順

### 1. Vercelでプロジェクトをインポート
1. [Vercel](https://vercel.com/)にログイン
2. "Import Project"をクリック
3. GitHubリポジトリ `WebAppAI0410/qlink_project` を選択

### 2. 環境変数の設定

以下の環境変数をVercelダッシュボードで設定：

#### 必須の環境変数
```
NEXT_PUBLIC_SUPABASE_URL=https://gahupdnnjeyfgmgbkhus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhaHVwZG5uamV5ZmdtZ2JraHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODYxMTQsImV4cCI6MjA2NDQ2MjExNH0.G54oGKfD_Y1WVcOMDDq6fon2TcnSNFzqRhtJRGfyecY
SUPABASE_SERVICE_ROLE_KEY=[Supabaseダッシュボードから取得]
```

#### Stripe設定（プレミアム機能使用時）
```
STRIPE_SECRET_KEY=[Stripeダッシュボードから取得]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Stripeダッシュボードから取得]
STRIPE_WEBHOOK_SECRET=[Webhookエンドポイント作成後に取得]
```

#### オプション設定
```
PERSPECTIVE_API_KEY=[Google Cloud Consoleから取得]
```

### 3. デプロイ設定
- **Framework Preset**: Next.js（自動検出）
- **Build Command**: `npm run build`
- **Node.js Version**: 18.x以上

### 4. デプロイ後の設定

#### Stripeウェブフック設定
1. Stripeダッシュボードでウェブフックエンドポイントを追加
2. エンドポイントURL: `https://your-domain.vercel.app/api/stripe/webhook`
3. リッスンするイベント: `checkout.session.completed`
4. Signing secretを環境変数 `STRIPE_WEBHOOK_SECRET` に設定

#### カスタムドメイン設定（オプション）
1. Vercelダッシュボード → Settings → Domains
2. カスタムドメインを追加
3. DNSレコードを設定

## トラブルシューティング

### ビルドエラーが発生する場合
- Node.jsバージョンが18以上であることを確認
- すべての必須環境変数が設定されていることを確認

### 認証が機能しない場合
- Supabaseの認証プロバイダー設定を確認
- リダイレクトURLが正しく設定されていることを確認

### 支払いが機能しない場合
- Stripe APIキーが正しく設定されていることを確認
- Webhookが正しく設定されていることを確認