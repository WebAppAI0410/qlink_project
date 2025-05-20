'use client';

import { useState } from 'react';
import { SocialLoginButton } from "./ui/social-login-button";
import { createClient } from '@/utils/supabase/client';

export function SocialLoginForm({ provider }: { provider: "google" | "twitter" }) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Supabaseのクライアントサイドでサインイン
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('認証エラー:', error);
        throw error;
      }

      // OAuthプロバイダーのURLにリダイレクト
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('ソーシャルログインエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const label = provider === 'google' ? 'Googleでログイン' : 'Xでログイン';
  const signUpLabel = provider === 'google' ? 'Googleで登録' : 'Xで登録';

  return (
    <SocialLoginButton 
      provider={provider} 
      onClick={handleLogin}
      className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
    >
      {isLoading ? '処理中...' : (window.location.pathname.includes('sign-up') ? signUpLabel : label)}
    </SocialLoginButton>
  );
} 