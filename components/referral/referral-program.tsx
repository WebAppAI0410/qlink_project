'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { getUserReferralStats } from '@/utils/referral';
import { Copy, Users, Gift, Share2 } from 'lucide-react';

interface ReferralProgramProps {
  userId: string;
  isPremium: boolean;
}

interface ReferralStats {
  totalReferrals: number;
  premiumReferrals: number;
  rewardsEarned: number;
  referrals: any[];
  referredBy: any;
}

export function ReferralProgram({ userId, isPremium }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    fetchReferralData();
  }, [userId, isPremium]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      
      // ユーザーの紹介コードを取得
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      setReferralCode(profile.referral_code || '');
      
      // 紹介統計を取得
      const statsData = await getUserReferralStats(userId);
      setStats(statsData);
      
    } catch (error) {
      console.error('紹介データの取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('コピーエラー:', error);
    }
  };

  const shareReferralCode = async () => {
    const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareText = `Qlinkで匿名で質問を受け付けています！この紹介リンクから登録すると特典があります：${referralUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Qlink - 匿名Q&Aサービス',
          text: shareText,
          url: referralUrl
        });
      } catch (error) {
        console.error('シェアエラー:', error);
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  if (!isPremium) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            お友達紹介プログラム
          </h3>
          <p className="text-gray-600 mb-6">
            お友達を紹介してプレミアム機能を無料で獲得しよう！
          </p>
          <Badge variant="outline" className="px-4 py-2 rounded-full">
            👑 プレミアム機能
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">紹介データを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 紹介コード共有 */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            🎁 お友達紹介プログラム
          </CardTitle>
          <CardDescription>
            お友達を紹介して、お互いに特典をゲットしよう！
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
            <h4 className="font-bold text-gray-800 mb-2">🎯 特典内容</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• お友達がプレミアム登録すると、あなたに1ヶ月無料プレゼント</li>
              <li>• お友達も初回登録時の特典を受けられます</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              あなたの紹介リンク
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/signup?ref=${referralCode}`}
                className="flex-1"
              />
              <Button
                onClick={copyReferralCode}
                variant={copied ? "default" : "outline"}
                size="sm"
                className="px-4"
              >
                {copied ? '✓' : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={shareReferralCode}
                variant="outline"
                size="sm"
                className="px-4"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              紹介コード: <span className="font-mono font-bold">{referralCode}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 紹介統計 */}
      {stats && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              📊 紹介実績
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalReferrals}
                </div>
                <div className="text-sm text-gray-600">紹介人数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">
                  {stats.premiumReferrals}
                </div>
                <div className="text-sm text-gray-600">プレミアム登録</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-2xl">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.rewardsEarned}
                </div>
                <div className="text-sm text-gray-600">獲得特典</div>
              </div>
            </div>

            {/* 紹介したユーザー一覧 */}
            {stats.referrals.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">紹介したお友達</h4>
                <div className="space-y-2">
                  {stats.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {referral.referred_user?.display_name || referral.referred_user?.username || 'ユーザー'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(referral.referred_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {referral.is_premium_signup && (
                          <Badge variant="default" className="text-xs">
                            👑 プレミアム
                          </Badge>
                        )}
                        {referral.reward_granted && (
                          <Badge variant="secondary" className="text-xs">
                            🎁 特典付与済み
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 自分を紹介してくれたユーザー */}
            {stats.referredBy && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">紹介してくれた方</h4>
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="font-medium text-gray-800">
                    {stats.referredBy.referrer_user?.display_name || stats.referredBy.referrer_user?.username}さん
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(stats.referredBy.referred_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 