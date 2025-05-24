'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AdBanner } from '@/components/ui/ad-banner';
import { usePremium } from '@/lib/hooks/use-premium';
import { QuestionAnalytics } from '@/components/analytics/question-analytics';
import { ReferralProgram } from '@/components/referral/referral-program';

interface Profile {
  username: string;
  display_name: string | null;
  profile_pic_url: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();
  const router = useRouter();
  const { isPremium } = usePremium(user);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || '');
        setDisplayName(profileData.display_name || '');
        setProfileImageUrl(profileData.profile_pic_url || '');
      }
    };
    
    fetchUserData();
  }, [supabase, router]);

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
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let newProfilePicUrl = profile?.profile_pic_url || '';

      // プロフィール画像のアップロード
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        console.log('画像アップロード開始:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileImage, { 
            cacheControl: '3600',
            upsert: false 
          });

        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError);
          throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
        }

        console.log('アップロード成功:', uploadData);

        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        newProfilePicUrl = urlData.publicUrl;
        console.log('新しい画像URL:', newProfilePicUrl);
      }

      // プロフィール情報の更新
      const updateData = {
        username: username || `user_${user.id.slice(0, 8)}`,
        display_name: displayName || null,
        ...(newProfilePicUrl && newProfilePicUrl !== profile?.profile_pic_url && { profile_pic_url: newProfilePicUrl }),
      };

      console.log('プロフィール更新データ:', updateData);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('プロフィール更新エラー:', updateError);
        throw updateError;
      }

      setSuccess('プロフィールを更新しました！');
      setProfileImage(null);
  
      // プロフィール情報を再取得
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        setProfileImageUrl(updatedProfile.profile_pic_url || '');
  }
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error);
      setError(error.message || 'プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-4xl">👤</div>
          <h1 className="text-3xl font-bold text-gray-800">
            プロフィール設定
          </h1>
          <p className="text-gray-600">
            あなたの情報を更新して、より良い体験を楽しみましょう
          </p>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-red-600 text-center">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="bg-green-50 border-green-200 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-green-600 text-center">✅ {success}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              ✨ プロフィール情報
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* プロフィール画像 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-sky-400 text-white text-2xl">
                      {displayName?.[0] || username?.[0] || user.email?.[0]?.toUpperCase() || '😊'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm text-gray-500 text-center">
                  📸 プロフィール画像をクリックして変更
                </p>
        </div>

              {/* メールアドレス */}
          <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  メールアドレス
                </Label>
                <Input 
                  id="email" 
                  value={user.email || ''} 
                  disabled 
                  className="rounded-xl border-gray-200 bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  メールアドレスは変更できません
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
                  className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              required 
              minLength={3}
            />
                <p className="text-xs text-gray-500">
              ユーザー名は公開され、URLに使用されます（3文字以上）
            </p>
          </div>
          
              {/* 表示名 */}
          <div className="space-y-2">
                <Label htmlFor="display_name" className="text-gray-700 font-medium">
                  表示名（オプション）
                </Label>
            <Input 
              id="display_name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例: 太郎"
                  className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
                <p className="text-xs text-gray-500">
              表示名は公開プロフィールに表示されます（省略可）
            </p>
          </div>
          
              {/* 送信ボタン */}
              <Button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>更新中...</span>
                  </div>
                ) : (
                  '💾 プロフィールを更新'
                )}
              </Button>
        </form>
          </CardContent>
        </Card>

        {/* アナリティクス機能 */}
        <QuestionAnalytics userId={user.id} isPremium={isPremium} />

        {/* お友達紹介プログラム */}
        <ReferralProgram userId={user.id} isPremium={isPremium} />

        {/* 広告バナー */}
        <AdBanner size="medium" position="bottom" isPremium={isPremium} />
      </div>
    </div>
  );
} 