# Qlink プレミアム機能テストガイド

## 概要
このドキュメントでは、Qlinkのプレミアム機能が正しく実装されているかを確認するためのテスト方法を説明します。

## 実装済みプレミアム機能一覧

### ✅ 完全実装済み
1. **広告非表示機能**
   - プレミアム会員には広告バナーが表示されない
   - 実装場所: `components/ui/ad-banner.tsx`

2. **文字数制限拡張**
   - 質問: 100文字 → 1,000文字
   - 回答: 500文字 → 2,000文字
   - 実装場所: `lib/hooks/use-premium.ts` の `getCharacterLimit`

3. **プレミアム状態管理**
   - データベースからのプレミアム状態取得
   - 実装場所: `lib/hooks/use-premium.ts`

4. **アナリティクス機能**
   - プレミアム会員のみ利用可能
   - 実装場所: `components/analytics/question-analytics.tsx`

5. **お友達紹介プログラム**
   - プレミアム会員のみ利用可能
   - 実装場所: `components/referral/referral-program.tsx`

## テスト方法

### 1. プレミアム状態の手動設定（開発用）

データベースに直接テストユーザーのプレミアム状態を設定します：

```sql
-- 1. テストユーザーのIDを確認
SELECT id, email FROM auth.users WHERE email = 'your-test-email@example.com';

-- 2. プレミアムプランIDを確認
SELECT id, name FROM premium_plans;

-- 3. テストユーザーにプレミアムサブスクリプションを設定
INSERT INTO user_subscriptions (
  user_id,
  plan_id,
  status,
  current_period_start,
  current_period_end
) VALUES (
  'ユーザーID',
  'プランID',
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
);
```

### 2. 機能別テスト手順

#### A. 広告非表示機能のテスト

**無料ユーザーの場合:**
1. ログアウト状態でホーム画面を確認 → 広告バナーが表示される
2. 無料ユーザーでログインしてダッシュボードを確認 → 広告バナーが表示される

**プレミアムユーザーの場合:**
1. プレミアムユーザーでログイン
2. ダッシュボード、プロフィール画面を確認 → 広告バナーが表示されない

#### B. 文字数制限拡張のテスト

**質問作成画面 (`/protected/questions/new`):**

無料ユーザー:
1. 100文字を超える質問を入力
2. 文字数カウンターが赤色になる
3. 「プレミアムで1,000文字まで」の表示を確認

プレミアムユーザー:
1. 1,000文字まで入力可能
2. プレミアムバッジが表示される
3. 文字数制限が1,000文字に拡張されている

**回答画面 (`/q/[shortId]`):**

無料ユーザーの質問:
- 回答文字数制限: 500文字

プレミアムユーザーの質問:
- 回答文字数制限: 2,000文字

#### C. アナリティクス機能のテスト

**プロフィール画面 (`/protected/profile`):**

無料ユーザー:
- アナリティクスセクションに「プレミアム機能」バッジが表示
- 実際のデータは表示されない

プレミアムユーザー:
- 質問・回答の統計データが表示される
- グラフやチャートが表示される

#### D. お友達紹介プログラムのテスト

**プロフィール画面:**

無料ユーザー:
- 紹介プログラムセクションに「プレミアム機能」バッジが表示

プレミアムユーザー:
- 紹介リンクが生成・表示される
- 紹介実績が表示される

### 3. UI/UXテスト

#### プレミアムページ (`/premium`)

1. **プラン表示の確認:**
   - 月額プラン（¥400/月）が表示される
   - 半年プラン（¥300/月、計¥1,800）が表示される
   - 半年プランに「人気プラン」バッジが表示される
   - 「¥600お得！」の表示を確認

2. **プレミアム会員の場合:**
   - 「現在プレミアム会員です」のメッセージが表示される
   - 購読ボタンが無効化される

3. **機能比較表の確認:**
   - 無料 vs プレミアムの機能差が明確に表示される

#### ヘッダーメニュー

プレミアムユーザー:
- ドロップダウンメニューに「プレミアム管理」が表示される

無料ユーザー:
- ドロップダウンメニューに「プレミアムにアップグレード」が表示される

### 4. データベース確認

#### プレミアム状態の確認クエリ

```sql
-- ユーザーのプレミアム状態を確認
SELECT 
  u.email,
  s.status,
  s.current_period_start,
  s.current_period_end,
  p.name as plan_name,
  p.price_monthly
FROM auth.users u
LEFT JOIN user_subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN premium_plans p ON s.plan_id = p.id
WHERE u.email = 'test@example.com';
```

#### プレミアム機能の利用状況確認

```sql
-- 質問の文字数分布（プレミアム効果の確認）
SELECT 
  CASE 
    WHEN LENGTH(content) <= 100 THEN '100文字以下'
    WHEN LENGTH(content) <= 1000 THEN '101-1000文字'
    ELSE '1000文字超'
  END as length_category,
  COUNT(*) as count
FROM questions
GROUP BY length_category;
```

### 5. 自動テストの実装

#### Jest/Testing Libraryを使用したテスト例

```typescript
// __tests__/premium-features.test.tsx
import { render, screen } from '@testing-library/react';
import { usePremium } from '@/lib/hooks/use-premium';
import { AdBanner } from '@/components/ui/ad-banner';

// モック
jest.mock('@/lib/hooks/use-premium');

describe('プレミアム機能テスト', () => {
  test('プレミアムユーザーには広告が表示されない', () => {
    (usePremium as jest.Mock).mockReturnValue({ isPremium: true });
    
    render(<AdBanner size="medium" position="bottom" isPremium={true} />);
    
    expect(screen.queryByText('広告')).not.toBeInTheDocument();
  });

  test('無料ユーザーには広告が表示される', () => {
    (usePremium as jest.Mock).mockReturnValue({ isPremium: false });
    
    render(<AdBanner size="medium" position="bottom" isPremium={false} />);
    
    expect(screen.getByText('広告')).toBeInTheDocument();
  });
});
```

### 6. パフォーマンステスト

#### プレミアム状態取得の性能確認

```sql
-- プレミアム状態取得クエリの実行計画確認
EXPLAIN ANALYZE
SELECT s.*, p.* 
FROM user_subscriptions s
JOIN premium_plans p ON s.plan_id = p.id
WHERE s.user_id = 'ユーザーID' 
  AND s.status = 'active' 
  AND s.current_period_end >= NOW();
```

### 7. エラーハンドリングテスト

1. **データベース接続エラー時:**
   - プレミアム状態が取得できない場合の動作確認
   - フォールバック処理の確認

2. **期限切れサブスクリプション:**
   - 期限切れ後の機能制限確認
   - 適切なメッセージ表示の確認

### 8. ブラウザテスト

#### 対応ブラウザでの動作確認
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

#### モバイルデバイステスト
- iOS Safari
- Android Chrome

### 9. 実装状況チェックリスト

#### ✅ 完全実装済み
- [x] プレミアム状態管理フック
- [x] 広告非表示機能
- [x] 文字数制限拡張（質問・回答）
- [x] アナリティクス機能の基盤
- [x] お友達紹介プログラムの基盤
- [x] プレミアムページUI
- [x] ヘッダーメニュー統合

#### 🔄 部分実装・要改善
- [ ] Stripe決済統合（モック状態）
- [ ] 詳細なアナリティクスデータ
- [ ] 実際の紹介プログラム機能
- [ ] プレミアムバッジ表示
- [ ] 回答の非表示機能

#### ❌ 未実装
- [ ] コンビニ決済
- [ ] 銀行振込
- [ ] 管理画面
- [ ] 詳細な統計レポート

### 10. 次のステップ

1. **決済機能の実装:**
   - Stripe本番環境設定
   - 実際の決済フロー実装

2. **機能の拡充:**
   - より詳細なアナリティクス
   - 実際の紹介プログラム
   - プレミアムバッジ表示

3. **運用準備:**
   - 監視システム構築
   - サポート体制整備
   - 法的文書作成

## まとめ

現在のQlinkプレミアム機能は基本的な実装が完了しており、主要な機能（広告非表示、文字数制限拡張、アナリティクス基盤）は正常に動作します。決済機能の実装により、実際のプレミアムサービスとして提供可能な状態です。 