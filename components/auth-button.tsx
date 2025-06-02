'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // クライアントサイドSupabaseクライアント
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // 必要に応じてリダイレクト処理など
    window.location.href = '/'; // トップページにリダイレクト
  };

  if (loading) {
    return <div className="h-10 w-20 animate-pulse bg-muted rounded-md" />;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm hidden sm:inline">こんにちは, {user.email?.split('@')[0]} さん</span>
      <Button variant="outline" onClick={handleSignOut} size="sm">
        ログアウト
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">新規登録</Link>
      </Button>
    </div>
  );
} 