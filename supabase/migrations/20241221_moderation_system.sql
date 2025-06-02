-- モデレーション結果を記録するテーブル
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'answer')),
  content_id UUID NOT NULL,
  original_content TEXT NOT NULL,
  is_appropriate BOOLEAN NOT NULL,
  reason TEXT,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  moderation_method VARCHAR(50) NOT NULL, -- 'deepseek', 'huggingface', 'keywords'
  action_taken VARCHAR(50), -- 'none', 'hidden', 'flagged', 'deleted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_moderation_logs_content ON public.moderation_logs(content_type, content_id);
CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_inappropriate ON public.moderation_logs(is_appropriate, severity);

-- RLSを有効化
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみがアクセス可能（今後管理画面で使用）
CREATE POLICY "Only admins can access moderation logs" ON public.moderation_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = TRUE
    )
  );

-- answersテーブルにモデレーション関連カラムを追加
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected'));
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS moderation_reason TEXT;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- questionsテーブルにもモデレーション機能を追加
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS moderation_reason TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- profilesテーブルに管理者フラグを追加（まだない場合）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- モデレーション状況を更新する関数
CREATE OR REPLACE FUNCTION update_moderation_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.moderated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- answersテーブルのトリガー
CREATE TRIGGER trigger_answers_moderation_update
  BEFORE UPDATE OF moderation_status
  ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION update_moderation_status();

-- questionsテーブルのトリガー
CREATE TRIGGER trigger_questions_moderation_update
  BEFORE UPDATE OF moderation_status
  ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION update_moderation_status(); 