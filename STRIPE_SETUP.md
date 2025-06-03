# Stripe決済機能セットアップガイド

## 概要

QlinkのプレミアムプランはStripeを使用した月額・半年額のサブスクリプション決済を提供します。

## 機能一覧

### 実装済み機能 ✅
- 月額プラン（400円/月）
- 半年プラン（1,800円/6ヶ月、実質300円/月）
- カード決済
- コンビニ決済（準備中）
- Checkout Session作成API
- Webhook処理
- プレミアム状態管理

### プレミアム機能
- 質問: 10,000文字まで（無料: 200文字）
- 回答: 1,000文字まで（無料: 100文字）
- 画像アップロード（最大4枚）
- 広告非表示
- 無制限の質問作成

## セットアップ手順

### 1. Stripeアカウントの作成

1. [Stripe](https://stripe.com/jp)でアカウント作成
2. ダッシュボードでAPIキーを取得
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### 2. 環境変数の設定

Vercelダッシュボードで以下を設定：

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Webhookの設定

1. Stripeダッシュボード → 開発者 → Webhook
2. エンドポイントを追加
   - URL: `https://qlink-project.vercel.app/api/stripe/webhook`
   - イベント:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Signing secretをコピーして環境変数に設定

### 4. データベースマイグレーション

Supabaseダッシュボードで以下のSQLを実行：

```sql
-- /supabase/migrations/20250603_premium_plans.sql を実行
```

### 5. テスト方法

#### 開発環境
```bash
# テストモードのカード番号
4242 4242 4242 4242

# 有効期限: 任意の将来の日付
# CVC: 任意の3桁
# 郵便番号: 任意の5桁
```

#### テスト実行
```bash
npm test __tests__/lib/stripe.test.ts
npm test __tests__/lib/hooks/use-premium.test.tsx
npm test __tests__/api/stripe/create-checkout-session.test.ts
```

## 本番環境への移行

### 1. Stripe本番キーの取得
- ダッシュボードで本番モードに切り替え
- APIキーを取得

### 2. 製品と価格の作成
```javascript
// Stripe CLI または API で実行
stripe products create \
  --name="Qlink プレミアムプラン" \
  --description="無制限の質問作成、画像アップロード、広告なし"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=400 \
  --currency=jpy \
  --recurring[interval]=month \
  --nickname="月額プラン"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=1800 \
  --currency=jpy \
  --recurring[interval]=month \
  --recurring[interval_count]=6 \
  --nickname="半年プラン"
```

### 3. 価格IDの更新
データベースの`premium_plans`テーブルに価格IDを設定

## トラブルシューティング

### 決済が完了しない
1. Webhookが正しく設定されているか確認
2. 環境変数が正しく設定されているか確認
3. Stripeダッシュボードでイベントログを確認

### プレミアム状態が反映されない
1. `user_subscriptions`テーブルを確認
2. Webhookのログを確認
3. `usePremium`フックのデバッグ

### エラー: "Stripe APIキーが設定されていません"
環境変数`STRIPE_SECRET_KEY`が設定されているか確認

## 参考リンク

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)