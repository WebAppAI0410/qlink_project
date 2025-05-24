# Qlink プレミアム機能実装計画

## 1. Twitter認証エラーの対応

### 問題の原因
- Supabaseは現在、OAuth認証でメールアドレスを必須としている
- Twitterアカウントの約30%がメールアドレスを設定していない
- エラー: "Error getting user email from external provider"

### 対応策
1. **短期対応**: ユーザーにTwitterアカウントでのメール設定を案内
2. **中期対応**: Supabaseの制限解除を待つ（開発チームが対応中）
3. **長期対応**: 必要に応じて独自認証システムの検討

## 2. 広告システムの実装 ✅ 完了### 2.1 バナー広告の配置 ✅- **ホーム画面**: ヒーローセクション下部- **ダッシュボード**: 統計カードの後- **質問作成ページ**: フォーム下部- **質問詳細ページ**: 質問カードと回答一覧の間- **プロフィールページ**: フォーム下部- **ログインページ**: フォーム下部（small）- **サインアップページ**: フォーム下部（small）- **公開質問ページ**: 質問カードの下（最重要収益源）### 2.2 広告コンポーネント設計 ✅```typescriptinterface AdBannerProps {  size: 'small' | 'medium' | 'large';  position: 'top' | 'sidebar' | 'bottom';  isPremium?: boolean;  className?: string;}```### 2.3 実装済み機能 ✅- モック広告バナーコンポーネント- プレミアム会員の広告非表示機能- レスポンシブデザイン対応- 複数の広告パターン

## 3. プレミアム機能の実装

### 3.1 データベース設計

#### プレミアム関連テーブル
```sql
-- プレミアムプラン
CREATE TABLE premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  price_monthly INTEGER NOT NULL, -- 円単位
  price_yearly INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーサブスクリプション
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES premium_plans(id),
  status VARCHAR(20) NOT NULL, -- active, canceled, expired
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 決済履歴
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'JPY',
  payment_method VARCHAR(50), -- stripe, convenience, bank_transfer
  status VARCHAR(20) NOT NULL, -- pending, completed, failed
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 プレミアム機能一覧

#### 基本プレミアム機能
- ✅ 広告非表示
- ✅ 質問文字数拡張（200字 → 10,000字）
- ✅ 回答文字数拡張（100字 → 1,000字）
- ✅ 回答の非表示機能
- ✅ アナリティクス（質問・回答統計）

#### 追加検討機能
- 🔄 質問のピン留め機能
- 🔄 カスタムテーマ
- 🔄 優先サポート
- 🔄 質問の有効期限設定
- 🔄 回答者のフィルタリング

### 3.3 料金プラン

#### プラン設計
```typescript
const PREMIUM_PLANS = {
  basic: {
    name: 'ベーシック',
    monthlyPrice: 500, // 円
    yearlyPrice: 5000, // 円（2ヶ月分お得）
    features: [
      '広告非表示',
      '質問文字数拡張',
      '回答文字数拡張'
    ]
  },
  pro: {
    name: 'プロ',
    monthlyPrice: 1000, // 円
    yearlyPrice: 10000, // 円
    features: [
      'ベーシック機能すべて',
      '回答の非表示機能',
      'アナリティクス',
      '優先サポート'
    ]
  }
};
```

## 4. 決済システムの実装

### 4.1 Stripe統合

#### 必要なStripe機能
- Subscription管理
- Webhook処理
- 日本の決済方法対応
  - クレジットカード
  - デビットカード
  - コンビニ決済（Konbini）
  - 銀行振込

#### Stripe設定
```typescript
// Stripeプロダクト作成
const products = await stripe.products.create({
  name: 'Qlink プレミアム',
  description: '広告非表示と拡張機能'
});

// 価格設定
const price = await stripe.prices.create({
  product: products.id,
  unit_amount: 50000, // 500円
  currency: 'jpy',
  recurring: { interval: 'month' }
});
```

### 4.2 決済フロー

#### サブスクリプション開始
1. プラン選択
2. Stripe Checkout Session作成
3. 決済処理
4. Webhook受信
5. データベース更新
6. ユーザー権限更新

#### 決済方法別対応
- **クレジットカード**: Stripe標準
- **コンビニ決済**: Stripe Konbini
- **銀行振込**: 手動処理（管理画面で確認）

## 5. 実装スケジュール

### Phase 1: 基盤実装（1週間） ✅ 完了- [x] データベーススキーマ作成- [x] プレミアム状態管理システム- [x] 基本的な権限チェック機能### Phase 2: 広告システム（3日） ✅ 完了- [x] モックバナー広告コンポーネント- [x] 広告表示/非表示ロジック- [x] レスポンシブ対応### Phase 3: Stripe統合（1週間） ✅ 完了- [x] Stripe設定- [x] サブスクリプション管理- [x] Webhook処理- [x] 決済フロー実装### Phase 4: プレミアム機能（1週間） ✅ 完了- [x] 文字数制限拡張- [x] プレミアムページ作成- [x] 決済成功ページ- [x] ヘッダーメニュー統合### Phase 5: 追加決済方法（1週間） 🔄 今後の実装- [ ] コンビニ決済対応- [ ] 銀行振込対応- [ ] 決済状況管理

## 6. 技術的考慮事項

### 6.1 セキュリティ
- Stripe Webhookの署名検証
- プレミアム機能の権限チェック
- 決済情報の暗号化

### 6.2 パフォーマンス
- プレミアム状態のキャッシュ
- 広告の遅延読み込み
- データベースインデックス最適化

### 6.3 ユーザビリティ
- 明確な料金表示
- 簡単なキャンセル手順
- 決済エラーの適切な処理

## 7. 運用・保守

### 7.1 監視項目
- サブスクリプション状況
- 決済成功率
- プレミアム機能利用率
- 広告収益

### 7.2 サポート体制
- 決済に関する問い合わせ対応
- プレミアム機能の使い方案内
- 技術的トラブルシューティング

## 8. 法的・規制対応### 8.1 必要な対応- 特定商取引法に基づく表記- プライバシーポリシー更新- 利用規約更新- 消費税対応### 8.2 コンプライアンス- PCI DSS準拠（Stripeが対応）- 個人情報保護法対応- 消費者契約法対応## 9. 環境変数設定### 9.1 必要な環境変数```bash# Stripe設定STRIPE_SECRET_KEY=sk_test_...STRIPE_PUBLISHABLE_KEY=pk_test_...STRIPE_WEBHOOK_SECRET=whsec_...# Supabase設定（既存）NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.coNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...SUPABASE_SERVICE_ROLE_KEY=eyJ...```### 9.2 Stripe設定手順1. Stripeアカウント作成2. APIキー取得3. Webhookエンドポイント設定4. 日本の決済方法有効化## 10. 実装完了状況### ✅ 完了済み機能- データベーススキーマ作成- プレミアム状態管理フック- 広告バナーコンポーネント- 文字数制限拡張機能- Stripe Checkout Session API- Stripe Webhook処理- プレミアムプラン選択ページ- 決済成功ページ- ヘッダーメニュー統合### 🔄 今後の実装予定- コンビニ決済対応- 銀行振込対応- 詳細な統計情報- 管理画面- 特定商取引法表記ページ### 📋 設定が必要な項目- Stripe本番環境設定- OAuth認証設定（Google、Twitter）- 実際の広告プロバイダー統合- 法的文書の作成 