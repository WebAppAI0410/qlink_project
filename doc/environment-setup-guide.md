# Qlink 環境変数設定ガイド

## 🔧 必要な環境変数

### 1. **Stripe決済設定（必須）**

#### テスト環境
```env
# Stripe テストキー
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 本番環境
```env
# Stripe 本番キー
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. **Supabase設定（既存）**
```env
NEXT_PUBLIC_SUPABASE_URL=https://bescdalknyjugpdorfay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. **OAuth認証設定（オプション）**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### 4. **Next.js設定**
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000  # 本番環境では実際のドメイン
```

## 📋 Supabaseでの環境変数設定方法

### **方法1: Supabase Dashboard**
1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. プロジェクト「qlink」を選択
3. Settings → Environment Variables
4. 各環境変数を追加

### **方法2: Supabase CLI**
```bash
# Supabase CLIで環境変数を設定
supabase secrets set STRIPE_SECRET_KEY sk_test_...
supabase secrets set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY pk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET whsec_...
```

### **方法3: Edge Functions**
`functions/env-config/index.ts`で環境変数を管理

## 🏪 Stripe設定手順

### **Step 1: Stripeアカウント作成**
1. [Stripe](https://stripe.com/jp)でアカウント作成
2. 日本のビジネスとして登録
3. 銀行口座情報を登録

### **Step 2: APIキー取得**
1. Stripe Dashboard → Developers → API keys
2. テスト環境のキーをコピー
3. 本番環境は後で設定

### **Step 3: Webhookエンドポイント設定**
1. Stripe Dashboard → Developers → Webhooks
2. エンドポイント追加: `https://yourdomain.com/api/stripe/webhook`
3. イベント選択:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### **Step 4: コンビニ決済有効化**
1. Stripe Dashboard → Settings → Payment methods
2. 「Konbini」を有効化
3. 日本の設定を確認

## 💳 決済方法別設定

### **クレジットカード決済**
- 追加設定不要
- Visa、Mastercard、JCB、AMEX対応

### **コンビニ決済（Konbini）**
```javascript
// 自動で対応店舗が設定される
// - セブン-イレブン
// - ローソン
// - ファミリーマート
// - ミニストップ
// - デイリーヤマザキ
// - セイコーマート
```

### **代引き決済（将来実装）**
```env
# ヤマト運輸 B2C
YAMATO_API_KEY=your_yamato_api_key
YAMATO_CUSTOMER_CODE=your_customer_code

# 佐川急便
SAGAWA_API_KEY=your_sagawa_api_key
SAGAWA_CUSTOMER_CODE=your_customer_code
```

## 🔒 セキュリティ設定

### **環境変数の管理**
- **秘密キー**: サーバー側でのみアクセス
- **公開キー**: クライアント側で使用可能
- **Webhook秘密**: Stripe署名検証に使用

### **本番環境の注意点**
1. **HTTPSの使用**: 必須
2. **ドメイン検証**: Stripe設定で本番ドメインを指定
3. **Webhook署名検証**: 必ず実装
4. **ログ監視**: 決済ログの監視設定

## 🧪 環境変数テスト

### **開発環境での確認**
```bash
# 開発サーバー起動時にコンソールで確認
npm run dev
# → 環境変数設定状況がコンソールに表示される
```

### **Edge Functionでの確認**
```bash
# Supabase Edge Function経由で確認
curl https://bescdalknyjugpdorfay.supabase.co/functions/v1/env-config
```

### **手動テスト**
```bash
# 環境変数の存在確認
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## 🚨 トラブルシューティング

### **決済が失敗する場合**
1. Stripe APIキーの確認
2. Webhook設定の確認
3. 環境変数の設定確認
4. ネットワーク接続の確認

### **コンビニ決済が表示されない場合**
1. Stripe Dashboardでkonbini決済が有効か確認
2. 日本のアカウント設定確認
3. APIバージョンの確認

### **環境変数が読み込まれない場合**
1. `.env.local`ファイルの確認（開発環境）
2. Supabase設定の確認
3. Next.js再起動
4. 環境変数名の確認（typoチェック）

## 📞 サポート

設定に関するお問い合わせ：
- **Stripe**: [Stripe サポート](https://support.stripe.com/)
- **Supabase**: [Supabase ヘルプ](https://supabase.com/support)
- **アプリ**: support@qlink.example.com 