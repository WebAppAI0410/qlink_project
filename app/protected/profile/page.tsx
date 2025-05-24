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
import { PremiumBadge } from '@/components/ui/premium-badge';
import { Crown, Calendar, CreditCard, Settings, User, Shield } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  username: string;
  display_name: string | null;
  profile_pic_url: string | null;
  avatar_url?: string;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const supabase = createClient();
  const router = useRouter();
  
  // usePremiumを常に呼び出すように修正（userがnullでも問題なし）
  const { isPremium, subscription, plan } = usePremium(user);

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
        setProfileImageUrl(profileData.profile_pic_url || profileData.avatar_url || '');
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
      let newProfilePicUrl = profile?.profile_pic_url || profile?.avatar_url || '';

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
        ...(newProfilePicUrl && newProfilePicUrl !== (profile?.profile_pic_url || profile?.avatar_url) && { 
          profile_pic_url: newProfilePicUrl,
          avatar_url: newProfilePicUrl 
        }),
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
        setProfileImageUrl(updatedProfile.profile_pic_url || updatedProfile.avatar_url || '');
      }
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error);
      setError(error.message || 'プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ローディング状態の表示（早期リターンを避ける）
  const isUserLoading = !user;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {isUserLoading ? (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ヘッダー */}
            <div className="text-center space-y-4">
              <div className="text-4xl">⚙️</div>
              <h1 className="text-3xl font-bold text-gray-800">
                アカウント設定
              </h1>
              <p className="text-gray-600">
                プロフィールとプランの管理
              </p>
            </div>

        {/* タブナビゲーション */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <User size={18} />
              プロフィール
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'subscription'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Crown size={18} />
              プラン管理
            </button>
          </div>
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

        {/* プロフィールタブ */}
        {activeTab === 'profile' && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
                <User size={20} />
                プロフィール情報
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
                    {isPremium && (
                      <div className="absolute -top-2 -right-2">
                        <PremiumBadge size="sm" />
                      </div>
                    )}
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
        )}

        {/* プラン管理タブ */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* 現在のプラン */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Shield size={20} />
                  現在のプラン
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isPremium ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PremiumBadge size="lg" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {plan?.name || 'プレミアムプラン'}
                          </h3>
                          <p className="text-gray-600">
                            すべての機能をお楽しみいただけます
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          ¥{plan?.price_monthly || 400}
                        </p>
                        <p className="text-sm text-gray-500">月額</p>
                      </div>
                    </div>
                    
                    {subscription && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">次回更新日</span>
                        </div>
                        <p className="text-blue-700">
                          {new Date(subscription.current_period_end).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        <Link href="/premium">
                          <Settings size={16} className="mr-2" />
                          プラン変更
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600"
                        onClick={() => {
                          // TODO: キャンセル機能の実装
                          alert('キャンセル機能は近日実装予定です');
                        }}
                      >
                        <CreditCard size={16} className="mr-2" />
                        解約
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">🆓</div>
                    <h3 className="text-xl font-bold text-gray-800">
                      フリープラン
                    </h3>
                    <p className="text-gray-600 mb-6">
                      基本機能をご利用いただけます
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl px-8 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Link href="/premium">
                        <Crown size={18} className="mr-2" />
                        プレミアムにアップグレード
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* プレミアム機能一覧 */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Crown size={20} />
                  プレミアム機能
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📝</span>
                      <span className="font-medium">文字数制限拡張</span>
                      {isPremium && <span className="text-green-600 text-sm">✓ 利用中</span>}
                    </div>
                    <p className="text-sm text-gray-600">
                      質問: 1,000文字、回答: 2,000文字まで
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🚫</span>
                      <span className="font-medium">広告非表示</span>
                      {isPremium && <span className="text-green-600 text-sm">✓ 利用中</span>}
                    </div>
                    <p className="text-sm text-gray-600">
                      すべての広告が非表示になります
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📊</span>
                      <span className="font-medium">詳細アナリティクス</span>
                      {isPremium && <span className="text-green-600 text-sm">✓ 利用中</span>}
                    </div>
                    <p className="text-sm text-gray-600">
                      質問の詳細な統計情報を確認
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📸</span>
                      <span className="font-medium">画像添付機能</span>
                      {isPremium && <span className="text-green-600 text-sm">✓ 利用中</span>}
                    </div>
                    <p className="text-sm text-gray-600">
                      質問に最大4枚まで画像を添付可能
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${isPremium ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👥</span>
                      <span className="font-medium">お友達紹介</span>
                      {isPremium && <span className="text-green-600 text-sm">✓ 利用中</span>}
                    </div>
                    <p className="text-sm text-gray-600">
                      紹介プログラムで特典をゲット
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

            {/* アナリティクス機能 - プレミアムユーザーのみ */}
            {!isUserLoading && (
              <>
                <QuestionAnalytics userId={user.id} isPremium={isPremium} />
                <ReferralProgram userId={user.id} isPremium={isPremium} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 