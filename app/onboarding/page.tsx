'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';

export default function OnboardingPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setProfileImageUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      let profilePicUrl = '';

      // プロフィール画像のアップロード
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileImage, { 
            cacheControl: '3600',
            upsert: false 
          });

        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError);
        } else {
          const { data } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);
          profilePicUrl = data.publicUrl;
        }
      }

      // プロフィール情報の更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username || `user_${user.id.slice(0, 8)}`,
          display_name: displayName || null,
          profile_pic_url: profilePicUrl || null,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('オンボーディングエラー:', error);
      setError(error.message || 'プロフィールの設定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 rounded-3xl shadow-xl p-8 space-y-8 border border-blue-100">
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800">
              ようこそ Qlink へ！
            </h1>
            <p className="text-gray-600 text-sm">
              あなたのプロフィールを設定して、<br />
              匿名Q&Aの世界を楽しみましょう✨
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* プロフィール画像 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-sky-400 text-white text-xl">
                    😊
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                📸 プロフィール画像を追加（オプション）
              </p>
            </div>

            {/* ユーザー名 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                ユーザー名 <span className="text-red-400">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: qlink_user"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
              <p className="text-xs text-gray-500">
                他のユーザーに表示される一意の名前です
              </p>
            </div>

            {/* 表示名 */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700 font-medium">
                表示名（オプション）
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例: 太郎"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-500">
                フレンドリーな名前を設定できます
              </p>
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl py-3 font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>設定中...</span>
                </div>
              ) : (
                '🚀 Qlinkを始める'
              )}
            </Button>
          </form>

          {/* フッター */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              後からいつでも設定を変更できます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 