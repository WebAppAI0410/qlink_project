# Qlink データベース設計 (Supabase/PostgreSQL)

## テーブル構造

### 1. users
ユーザー情報を管理するテーブル

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(64),
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(256),
  profile_pic_url VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auth_source VARCHAR(20) DEFAULT 'email', -- email, google, twitter
  is_premium BOOLEAN DEFAULT FALSE,
  oauth_access_token VARCHAR(1024),
  oauth_refresh_token VARCHAR(1024),
  oauth_token_expires_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- RLSポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータ表示を許可
CREATE POLICY "ユーザーは自分のデータを表示できる" ON users
  FOR SELECT USING (auth.uid() = id);

-- ユーザー自身のデータ更新を許可
CREATE POLICY "ユーザーは自分のデータを更新できる" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. questions
質問情報を管理するテーブル

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(10) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_open BOOLEAN DEFAULT TRUE,
  best_answer_id UUID
);

-- 短縮IDインデックス
CREATE INDEX idx_questions_short_id ON questions(short_id);

-- ユーザーIDインデックス
CREATE INDEX idx_questions_user_id ON questions(user_id);

-- RLSポリシー
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 質問の閲覧は全員可能
CREATE POLICY "質問は全員表示可能" ON questions
  FOR SELECT USING (TRUE);

-- 質問の作成は認証済みユーザーのみ可能
CREATE POLICY "質問の作成は認証済みユーザーのみ" ON questions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 質問の更新は作成者のみ可能
CREATE POLICY "質問の更新は作成者のみ" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

-- 質問の削除は作成者のみ可能
CREATE POLICY "質問の削除は作成者のみ" ON questions
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. answers
回答情報を管理するテーブル

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(10) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45) -- IPv6対応
);

-- 短縮IDインデックス
CREATE INDEX idx_answers_short_id ON answers(short_id);

-- 質問IDインデックス
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- RLSポリシー
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 回答の閲覧は全員可能（非表示設定されていない場合）
CREATE POLICY "回答は全員表示可能（非表示以外）" ON answers
  FOR SELECT USING (is_hidden = FALSE OR 
    (is_hidden = TRUE AND EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    ))
  );

-- 回答の作成は全員可能（認証不要）
CREATE POLICY "回答の作成は全員可能" ON answers
  FOR INSERT WITH CHECK (TRUE);

-- 回答の更新（非表示設定など）は質問作成者のみ可能
CREATE POLICY "回答の更新は質問作成者のみ" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );
```

### 4. notifications
通知情報を管理するテーブル

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'new_answer', 'system', etc.
  content TEXT NOT NULL,
  related_id UUID, -- 関連する質問や回答のID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザーIDインデックス
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 既読状態インデックス
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- RLSポリシー
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 通知の閲覧は対象ユーザーのみ可能
CREATE POLICY "通知の閲覧は対象ユーザーのみ" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 通知の更新は対象ユーザーのみ可能
CREATE POLICY "通知の更新は対象ユーザーのみ" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

### 5. user_settings
ユーザー設定情報を管理するテーブル

```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  notification_frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'system'
  language VARCHAR(10) DEFAULT 'ja', -- 'ja', 'en', etc.
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 設定の閲覧は対象ユーザーのみ可能
CREATE POLICY "設定の閲覧は対象ユーザーのみ" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- 設定の更新は対象ユーザーのみ可能
CREATE POLICY "設定の更新は対象ユーザーのみ" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

## インデックス設計

主要検索パターンに基づいて以下のインデックスを追加で作成

```sql
-- ユーザー名検索用インデックス
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 質問・回答の時系列検索用インデックス
CREATE INDEX idx_questions_created_at ON questions(user_id, created_at DESC);
CREATE INDEX idx_answers_created_at ON answers(question_id, created_at DESC);

-- 複合インデックス（ユーザーと投稿状態など）
CREATE INDEX idx_questions_user_status ON questions(user_id, is_open);
```

## 関数とトリガー

### short_id生成関数

```sql
CREATE OR REPLACE FUNCTION generate_short_id(length INT DEFAULT 7)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 質問作成時に自動的にshort_idを生成
CREATE OR REPLACE FUNCTION set_question_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  unique_found BOOLEAN := FALSE;
BEGIN
  WHILE NOT unique_found LOOP
    new_short_id := generate_short_id();
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM questions WHERE short_id = new_short_id) THEN
        NEW.short_id := new_short_id;
        unique_found := TRUE;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      -- 競合した場合は再試行
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_question_short_id
BEFORE INSERT ON questions
FOR EACH ROW
WHEN (NEW.short_id IS NULL)
EXECUTE FUNCTION set_question_short_id();

-- 回答作成時に自動的にshort_idを生成（同様）
CREATE OR REPLACE FUNCTION set_answer_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  unique_found BOOLEAN := FALSE;
BEGIN
  WHILE NOT unique_found LOOP
    new_short_id := generate_short_id();
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM answers WHERE short_id = new_short_id) THEN
        NEW.short_id := new_short_id;
        unique_found := TRUE;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      -- 競合した場合は再試行
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_answer_short_id
BEFORE INSERT ON answers
FOR EACH ROW
WHEN (NEW.short_id IS NULL)
EXECUTE FUNCTION set_answer_short_id();
```

### 回答通知トリガー

```sql
-- 回答が作成されたときに質問者に通知を送る
CREATE OR REPLACE FUNCTION notify_question_owner()
RETURNS TRIGGER AS $$
DECLARE
  question_user_id UUID;
BEGIN
  -- 質問の作成者IDを取得
  SELECT user_id INTO question_user_id
  FROM questions
  WHERE id = NEW.question_id;
  
  -- 通知を作成
  INSERT INTO notifications (
    user_id,
    type,
    content,
    related_id
  ) VALUES (
    question_user_id,
    'new_answer',
    '質問に新しい回答が届きました',
    NEW.question_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_question_owner
AFTER INSERT ON answers
FOR EACH ROW
EXECUTE FUNCTION notify_question_owner();
```

## Supabase設定

### 認証設定

```
// supabase/config.toml

[auth]
# ユーザー登録を有効化
enable_signup = true

# JWTトークンの有効期限（秒）
jwt_expiry = 3600

# リフレッシュトークンの有効期限（秒）
refresh_token_expiry = 2592000 # 30日間

# パスワードの最小長
min_password_length = 8

# OAuth設定
[auth.external.google]
enabled = true
client_id = "GOOGLE_CLIENT_ID"
secret = "GOOGLE_CLIENT_SECRET"
redirect_uri = "https://your-app-url.com/auth/callback"

[auth.external.twitter]
enabled = true
client_id = "TWITTER_CLIENT_ID"
secret = "TWITTER_CLIENT_SECRET"
redirect_uri = "https://your-app-url.com/auth/callback"
```

### ストレージバケット設定

```
// Storage buckets for profile images

- profile_images (public)
  - Security: Only authenticated users can upload
  - File size limit: 2MB
  - Allowed file types: image/jpeg, image/png, image/webp, image/gif
```