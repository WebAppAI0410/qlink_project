import { createBrowserClient } from "@supabase/ssr";

// デフォルト値として静的な環境変数を使用
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bescdalknyjugpdorfay.supabase.co';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2NkYWxrbnlqdWdwZG9yZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzAyMDMsImV4cCI6MjA2MzI0NjIwM30.i--EX-fL516pVKDX7hEQZ4RZQvKIgUKzOhz4bfkx-Dk';

// Edge Functionから最新の環境変数を取得する試み
if (typeof window !== 'undefined') {
  fetch('https://bescdalknyjugpdorfay.supabase.co/functions/v1/env-config')
    .then(response => response.json())
    .then(data => {
      supabaseUrl = data.SUPABASE_URL;
      supabaseAnonKey = data.SUPABASE_ANON_KEY;
    })
    .catch(error => {
      console.error('環境変数の取得に失敗しました:', error);
    });
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
