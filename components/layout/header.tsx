'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { usePremium } from '@/lib/hooks/use-premium'
import { Crown } from 'lucide-react'

interface Profile {
  username: string;
  display_name: string | null;
  profile_pic_url: string | null;
}

export default function Header({ user }: { user: User | null }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();
  const { isPremium } = usePremium(user);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('username, display_name, profile_pic_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      };
      
      fetchProfile();
    }
  }, [user, supabase]);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl">💬</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent group-hover:from-sky-500 group-hover:to-blue-500 transition-all duration-300">
            Qlink
            </span>
          </Link>
          {user && (
            <nav className="hidden md:flex gap-6">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:scale-105 transform"
              >
                🏠 ホーム
              </Link>
              <Link 
                href="/protected/questions/new" 
                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:scale-105 transform px-3 py-1 rounded-xl hover:bg-green-50"
              >
                ✍️ 質問作成
              </Link>
              <Link 
                href="/protected/profile" 
                className="text-gray-600 hover:text-sky-600 font-medium transition-colors duration-200 hover:scale-105 transform"
              >
                👤 プロフィール
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* モバイル用質問作成ボタン */}
              <Button 
                asChild 
                size="sm"
                className="md:hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              >
                <Link href="/protected/questions/new">✍️</Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-110 transition-transform duration-200">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                      <AvatarImage src={profile?.profile_pic_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-sky-400 text-white font-medium">
                        {profile?.display_name?.[0] || profile?.username?.[0] || user.email?.[0]?.toUpperCase() || '😊'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border border-blue-100 shadow-xl rounded-2xl p-2">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium text-gray-800">
                      {profile?.display_name || profile?.username || 'ユーザー'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-blue-100" />
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-blue-50 cursor-pointer">
                    <Link href="/protected/profile" className="flex items-center gap-2">
                      <span>👤</span> プロフィール
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-sky-50 cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <span>🏠</span> ホーム
                    </Link>
                  </DropdownMenuItem>
                  {isPremium ? (
                    <DropdownMenuItem asChild className="rounded-xl hover:bg-yellow-50 cursor-pointer">
                      <Link href="/premium" className="flex items-center gap-2 text-yellow-600">
                        <Crown className="w-4 h-4" /> プレミアム管理
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="rounded-xl hover:bg-yellow-50 cursor-pointer">
                      <Link href="/premium" className="flex items-center gap-2 text-yellow-600 font-medium">
                        <Crown className="w-4 h-4" /> プレミアムにアップグレード
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-50 cursor-pointer">
                    <Link href="/settings" className="flex items-center gap-2">
                      <span>⚙️</span> 設定
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-blue-100" />
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-red-50 cursor-pointer text-red-600">
                    <Link href="/logout" prefetch={false} className="flex items-center gap-2">
                      <span>👋</span> ログアウト
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button 
                asChild 
                variant="ghost" 
                className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              >
                <Link href="/login">ログイン</Link>
              </Button>
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105"
              >
                <Link href="/signup">✨ 新規登録</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 