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
      
      console.log('ソーシャルログイン開始:', provider);
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('リダイレクトURL (アプリケーション側):', redirectUrl);
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          scopes: provider === 'google' ? 'profile email' : undefined
        },
      });
      
      if (signInError) {
        console.error('認証エラー (signInWithOAuth):', signInError);
        setError(`認証エラー: ${signInError.message} (コード: ${signInError.code || 'N/A'})`);
        return; 
      }

      console.log('サインインデータ (signInWithOAuth):', data);
      
      if (data?.url) {
        console.log('Google認証ページへのリダイレクト先URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('リダイレクトURLが取得できませんでした。signInWithOAuthからのdata:', data);
        setError('リダイレクトURLが取得できませんでした。Supabaseからの応答を確認してください。');
      }
    } catch (error: any) {
      console.error('ソーシャルログインエラー (catchブロック):', error);
      setError(`予期せぬエラーが発生しました: ${error?.message || '不明なエラー'}`);
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