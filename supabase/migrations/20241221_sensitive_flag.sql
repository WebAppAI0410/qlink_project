-- questionsテーブルにセンシティブフラグを追加
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT FALSE;

-- センシティブ質問用のインデックス
CREATE INDEX IF NOT EXISTS idx_questions_sensitive ON public.questions(is_sensitive); 