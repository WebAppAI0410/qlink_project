-- プレミアムプランとサブスクリプション管理用テーブル

-- プレミアムプランマスタテーブル
CREATE TABLE IF NOT EXISTS public.premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- 円単位
  interval TEXT NOT NULL, -- 'month' or 'semi-annual'
  interval_count INTEGER DEFAULT 1,
  stripe_price_id TEXT UNIQUE,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーのサブスクリプション管理テーブル（既存のテーブルを更新）
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_id UUID REFERENCES public.premium_plans(id),
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'unpaid'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stripe_subscription_id)
);

-- 支払い履歴テーブル（既存のテーブルを更新）
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- 円単位
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed', 'refunded'
  payment_method TEXT, -- 'card', 'konbini', 'bank_transfer'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);

-- RLSポリシー
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- プレミアムプランは誰でも閲覧可能
CREATE POLICY "Premium plans are viewable by everyone" ON public.premium_plans
  FOR SELECT USING (is_active = true);

-- ユーザーは自分のサブスクリプションのみ閲覧可能
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の支払い履歴のみ閲覧可能
CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- 更新時刻自動更新トリガー
CREATE TRIGGER update_premium_plans_updated_at BEFORE UPDATE ON public.premium_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期プランデータの挿入
INSERT INTO public.premium_plans (name, description, price, interval, interval_count, features) VALUES
  ('月額プラン', '毎月更新のスタンダードプラン', 400, 'month', 1, 
   '["10,000文字の質問作成", "1,000文字の回答", "画像アップロード（最大4枚）", "広告非表示", "優先サポート"]'::jsonb),
  ('半年プラン', '6ヶ月ごと更新のお得なプラン（実質月額300円）', 1800, 'month', 6,
   '["10,000文字の質問作成", "1,000文字の回答", "画像アップロード（最大4枚）", "広告非表示", "優先サポート", "25%割引"]'::jsonb)
ON CONFLICT DO NOTHING;