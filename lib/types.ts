import { User } from "@supabase/supabase-js";

// Supabase Auth関連の型
export type AuthUser = {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
  };
};

// プロフィール関連の型
export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  profile_pic_url?: string;
  created_at: string;
  updated_at?: string;
  auth_source: 'email' | 'google' | 'twitter';
  is_premium: boolean;
  last_login?: string;
}

// 質問関連の型
export interface Question {
  id: string;
  short_id: string;
  content: string;
  user_id: string;
  created_at: string;
  is_open: boolean;
  best_answer_id?: string;
  user?: Profile;
  _count?: {
    answers: number;
  };
}

// 回答関連の型
export interface Answer {
  id: string;
  short_id: string;
  content: string;
  question_id: string;
  created_at: string;
  is_hidden: boolean;
  ip_address?: string;
}

// 通知関連の型
export type Notification = {
  id: string;
  user_id: string;
  type: 'new_answer' | 'system';
  content: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
};

// ユーザー設定関連の型
export type UserSettings = {
  user_id: string;
  email_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  updated_at: string;
};

// データベースの型定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      questions: {
        Row: Omit<Question, 'user' | 'answers' | '_count'>;
        Insert: Omit<Question, 'id' | 'short_id' | 'created_at' | 'user' | 'answers' | '_count'>;
        Update: Partial<Omit<Question, 'id' | 'short_id' | 'created_at' | 'user_id' | 'user' | 'answers' | '_count'>>;
      };
      answers: {
        Row: Answer;
        Insert: Omit<Answer, 'id' | 'created_at'>;
        Update: Partial<Omit<Answer, 'id' | 'created_at' | 'question_id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'user_id' | 'type'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'user_id' | 'updated_at'>>;
      };
    };
  };
}; 