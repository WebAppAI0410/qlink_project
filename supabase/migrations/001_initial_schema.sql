-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(64) UNIQUE,
  display_name VARCHAR(64),
  profile_pic_url VARCHAR(256),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(10) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_open BOOLEAN DEFAULT TRUE,
  best_answer_id UUID
);

-- Create indexes for questions
CREATE INDEX idx_questions_short_id ON public.questions(short_id);
CREATE INDEX idx_questions_user_id ON public.questions(user_id);
CREATE INDEX idx_questions_created_at ON public.questions(user_id, created_at DESC);

-- Enable RLS on questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON public.questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON public.questions
  FOR DELETE USING (auth.uid() = user_id);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(10) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE,
  ip_address INET
);

-- Create indexes for answers
CREATE INDEX idx_answers_short_id ON public.answers(short_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_answers_created_at ON public.answers(question_id, created_at DESC);

-- Enable RLS on answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Answers policies
CREATE POLICY "Answers are viewable by everyone (except hidden)" ON public.answers
  FOR SELECT USING (
    is_hidden = FALSE OR 
    (is_hidden = TRUE AND EXISTS (
      SELECT 1 FROM public.questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    ))
  );

CREATE POLICY "Anyone can create answers" ON public.answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Question owners can update answers" ON public.answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to generate short IDs
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

-- Function to set question short_id
CREATE OR REPLACE FUNCTION set_question_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  unique_found BOOLEAN := FALSE;
BEGIN
  WHILE NOT unique_found LOOP
    new_short_id := generate_short_id();
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.questions WHERE short_id = new_short_id) THEN
        NEW.short_id := new_short_id;
        unique_found := TRUE;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      -- Retry on conflict
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for question short_id
CREATE TRIGGER trigger_set_question_short_id
BEFORE INSERT ON public.questions
FOR EACH ROW
WHEN (NEW.short_id IS NULL OR NEW.short_id = '')
EXECUTE FUNCTION set_question_short_id();

-- Function to set answer short_id
CREATE OR REPLACE FUNCTION set_answer_short_id()
RETURNS TRIGGER AS $$
DECLARE
  new_short_id TEXT;
  unique_found BOOLEAN := FALSE;
BEGIN
  WHILE NOT unique_found LOOP
    new_short_id := generate_short_id();
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM public.answers WHERE short_id = new_short_id) THEN
        NEW.short_id := new_short_id;
        unique_found := TRUE;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      -- Retry on conflict
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for answer short_id
CREATE TRIGGER trigger_set_answer_short_id
BEFORE INSERT ON public.answers
FOR EACH ROW
WHEN (NEW.short_id IS NULL OR NEW.short_id = '')
EXECUTE FUNCTION set_answer_short_id();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to notify question owner of new answers
CREATE OR REPLACE FUNCTION notify_question_owner()
RETURNS TRIGGER AS $$
DECLARE
  question_user_id UUID;
BEGIN
  SELECT user_id INTO question_user_id
  FROM public.questions
  WHERE id = NEW.question_id;
  
  INSERT INTO public.notifications (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on new answer
CREATE TRIGGER trigger_notify_question_owner
AFTER INSERT ON public.answers
FOR EACH ROW
EXECUTE FUNCTION notify_question_owner();