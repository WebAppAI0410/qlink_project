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
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/auth/callback`;
      
      console.log('リダイレクトURL (アプリケーション側):', redirectUrl);
      console.log('サイトオリジン:', currentUrl);
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          scopes: provider === 'google' ? 'profile email' : 'users.read tweet.read offline.access'
        },
      });
      
      if (signInError) {
        console.error('認証エラー (signInWithOAuth):', {
          message: signInError.message,
          code: signInError.code || 'コードなし',
          stack: signInError.stack
        });
        
        let errorMessage = `認証エラー: ${signInError.message}`;
        if (signInError.message.includes('provider')) {
          errorMessage = 'このプロバイダーは現在使用できません。管理者にTwitter認証の設定を確認してもらってください。';
        }
        
        setError(errorMessage);
        return; 
      }

      console.log('サインインデータ (signInWithOAuth):', data);
      
      if (data?.url) {
        console.log('認証ページへのリダイレクト先URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('リダイレクトURLが取得できませんでした', data);
        setError('認証プロセスの初期化に失敗しました。Supabaseプロジェクト設定を確認してください。');
      }
    } catch (error: any) {
      console.error('ソーシャルログインエラー (catch):', error);
      setError(`予期せぬエラーが発生しました: ${error?.message || '詳細不明'}`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    }
  };

  const label = provider === 'google' ? 'Googleでログイン' : 'Xでログイン';
  const signUpLabel = provider === 'google' ? 'Googleで登録' : 'Xで登録';
  const displayLabel = typeof window !== 'undefined' && window.location.pathname.includes('sign-up') 
    ? signUpLabel 
    : label;

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