'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';

export default function PremiumSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('セッションIDが見つかりません');
      setLoading(false);
      return;
    }

    // 決済完了の確認処理（実際の実装では必要に応じて追加）
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">決済を確認中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl">
              <Link href="/premium">プレミアムページに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* 成功メッセージ */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="text-8xl animate-bounce">🎉</div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            プレミアム会員へようこそ！
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            決済が正常に完了しました。これからプレミアム機能をお楽しみください！
          </p>
        </div>

        {/* 成功カード */}
        <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-0 shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">決済完了</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-white/80 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                プレミアム機能が利用可能になりました
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>広告の非表示</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>質問の文字数制限拡張（10,000文字まで）</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>回答の文字数制限拡張（5,000文字まで）</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>優先サポート</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>詳細な統計情報</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                次のステップ
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li>• ダッシュボードで新機能を確認</li>
                <li>• より詳細な質問を作成してみる</li>
                <li>• プロフィールでプレミアムバッジを確認</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-8 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Link href="/dashboard">🏠 ダッシュボードへ</Link>
              </Button>
              <Button 
                asChild 
                variant="outline"
                className="rounded-xl border-2 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50 px-8 py-3 font-medium transition-all duration-200"
              >
                <Link href="/premium">👑 プレミアム管理</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* サポート情報 */}
        <Card className="bg-gray-50 border-gray-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-gray-800 mb-2">サポートが必要ですか？</h3>
            <p className="text-gray-600 mb-4">
              プレミアム機能についてご質問がございましたら、お気軽にお問い合わせください。
            </p>
            <Button 
              asChild 
              variant="outline"
              className="rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100"
            >
              <Link href="/support">📧 サポートに連絡</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 