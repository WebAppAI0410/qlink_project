'use client';

import { useState } from 'react';
import { SocialLoginButton } from "./ui/social-login-button";
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function SocialLoginForm({ provider }: { provider: "google" | "twitter" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // デバッグ情報をコンソールに出力
      console.log('ソーシャルログイン開始:', provider);
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('リダイレクトURL:', redirectUrl);
      
      // Supabaseのクライアントサイドでサインイン
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          // Google Profile情報を取得するための追加スコープ
          scopes: provider === 'google' ? 'profile email' : undefined
        },
      });
      
      if (error) {
        console.error('認証エラー:', error);
        setError(`認証エラー: ${error.message}`);
        throw error;
      }

      console.log('サインインデータ:', data);
      
      // OAuthプロバイダーのURLにリダイレクト
      if (data?.url) {
        console.log('リダイレクト先URL:', data.url);
        window.location.href = data.url;
      } else {
        setError('リダイレクトURLが取得できませんでした');
      }
    } catch (error: any) {
      console.error('ソーシャルログインエラー:', error);
      setError(`エラーが発生しました: ${error?.message || '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const label = provider === 'google' ? 'Googleでログイン' : 'Xでログイン';
  const signUpLabel = provider === 'google' ? 'Googleで登録' : 'Xで登録';
  const displayLabel = window.location.pathname.includes('sign-up') ? signUpLabel : label;

  return (
    <div className="w-full">
      <SocialLoginButton 
        provider={provider} 
        onClick={handleLogin}
        className={isLoading ? 'opacity-70 cursor-not-allowed w-full' : 'w-full'}
        disabled={isLoading}
      >
        {isLoading ? '処理中...' : displayLabel}
      </SocialLoginButton>
      
      {error && (
        <Alert className="mt-2 bg-red-50 text-red-800 border-red-200 p-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 