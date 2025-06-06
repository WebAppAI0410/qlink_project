'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePremium } from '@/lib/hooks/use-premium';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap, Shield, BarChart3, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStripe } from '@/lib/stripe';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  periodLabel: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

export default function PremiumPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'konbini' | 'both'>('card');
  const router = useRouter();
  const supabase = createClient();
  
  const { isPremium, subscription, plan: currentPlan } = usePremium(user);

  // 固定のプラン設定
  const plans: PremiumPlan[] = [
    {
      id: 'monthly',
      name: '月額プラン',
      price: 400,
      period: 'monthly',
      periodLabel: '月',
      features: [
        '広告非表示',
        '質問文字数制限緩和 (100文字→1,000文字)',
        '回答文字数制限緩和 (500文字→2,000文字)',
        '質問アナリティクス機能',
        'お友達紹介プログラム',
        'プロフィールカスタマイズ強化',
        '高度な検索機能',
        'プレミアムバッジ表示'
      ]
    },
    {
      id: 'semi-annual',
      name: '半年プラン',
      price: 300,
      originalPrice: 400,
      period: 'semi-annual',
      periodLabel: '月',
      features: [
        '広告非表示',
        '質問文字数制限緩和 (100文字→1,000文字)',
        '回答文字数制限緩和 (500文字→2,000文字)',
        '質問アナリティクス機能',
        'お友達紹介プログラム',
        'プロフィールカスタマイズ強化',
        '高度な検索機能',
        'プレミアムバッジ表示'
      ],
      isPopular: true,
      savings: '25%お得'
    }
  ];

  useEffect(() => {
    fetchUser();
    setLoading(false);
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSubscribe = async (plan: PremiumPlan) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: plan.period,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }

      // Stripe Checkoutにリダイレクト
      const stripe = await getStripe();
      const { error } = await stripe!.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('決済エラー:', error);
      alert(`決済の開始に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const featureIcons = {
    '広告非表示': <Shield className="w-5 h-5 text-green-500" />,
    '質問文字数制限緩和 (100文字→1,000文字)': <Zap className="w-5 h-5 text-blue-500" />,
    '回答文字数制限緩和 (500文字→2,000文字)': <Zap className="w-5 h-5 text-blue-500" />,
    '質問アナリティクス機能': <BarChart3 className="w-5 h-5 text-orange-500" />,
    'お友達紹介プログラム': <Crown className="w-5 h-5 text-purple-500" />,
    'プロフィールカスタマイズ強化': <Crown className="w-5 h-5 text-purple-500" />,
    '高度な検索機能': <Zap className="w-5 h-5 text-blue-500" />,
    'プレミアムバッジ表示': <Crown className="w-5 h-5 text-yellow-500" />
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">プランを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Qlink プレミアム
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            広告なしで快適に、さらに多くの機能でQlinkを最大限活用しよう 🚀
          </p>
        </div>

        {/* 現在のプレミアム状態 */}
        {isPremium && (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl p-6 mb-8 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-2">プレミアム会員です！ 🎉</h2>
            <p className="opacity-90">
              現在のプラン: {currentPlan?.name} | 
              有効期限: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('ja-JP') : '不明'}
            </p>
          </div>
        )}

        {/* プラン一覧 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-200 hover:scale-105
                ${plan.isPopular ? 'ring-2 ring-blue-500 scale-105' : 'hover:shadow-2xl'}
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    人気プラン
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    ¥{plan.price.toLocaleString()}
                    <span className="text-lg text-gray-500">/{plan.periodLabel}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-gray-400 line-through">
                        ¥{plan.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>
                {plan.period === 'semi-annual' && (
                  <p className="text-sm text-green-600 font-medium">
                    半年一括 ¥1,800（¥600お得！）
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {featureIcons[feature as keyof typeof featureIcons] || <Check className="w-5 h-5 text-green-500" />}
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isPremium}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${isPremium
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-800 text-white hover:bg-gray-900 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isPremium
                  ? '現在プレミアム会員です'
                  : `${plan.name}を始める`
                }
              </button>
            </div>
          ))}
        </div>

        {/* 機能比較表 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">機能比較 📊</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-800">機能</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-800">無料</th>
                  <th className="text-center py-4 px-6 font-bold text-blue-600">プレミアム</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6">質問文字数</td>
                  <td className="text-center py-4 px-6">100字</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">1,000字</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">回答文字数</td>
                  <td className="text-center py-4 px-6">500字</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">2,000字</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">広告表示</td>
                  <td className="text-center py-4 px-6">あり</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">なし</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">アナリティクス</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">お友達紹介</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">プレミアムバッジ</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6 text-blue-600 font-medium">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">よくある質問 ❓</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">いつでもキャンセルできますか？</h3>
              <p className="text-gray-600">はい、いつでもキャンセル可能です。次回の請求日まで機能をご利用いただけます。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">支払い方法は？</h3>
              <p className="text-gray-600">クレジットカード、デビットカード、コンビニ決済、銀行振込に対応しています。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">半年プランの途中解約は？</h3>
              <p className="text-gray-600">半年プランも途中解約可能です。残り期間分の返金はございませんが、期間終了まで機能をご利用いただけます。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">プラン変更はできますか？</h3>
              <p className="text-gray-600">月額プランから半年プランへの変更は可能です。次回請求日から新しいプランが適用されます。</p>
            </div>
          </div>
        </div>

        {/* 決済方法選択 */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 text-center flex items-center justify-center gap-2">
              💳 決済方法を選択
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">💳</div>
                  <h3 className="font-medium text-gray-800">クレジットカード</h3>
                  <p className="text-sm text-gray-600">即座に利用開始</p>
                  {paymentMethod === 'card' && (
                    <div className="text-blue-600 text-sm font-medium">✓ 選択中</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('konbini')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'konbini'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">🏪</div>
                  <h3 className="font-medium text-gray-800">コンビニ決済</h3>
                  <p className="text-sm text-gray-600">3日以内にお支払い</p>
                  {paymentMethod === 'konbini' && (
                    <div className="text-green-600 text-sm font-medium">✓ 選択中</div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('both')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'both'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">🔄</div>
                  <h3 className="font-medium text-gray-800">どちらでも</h3>
                  <p className="text-sm text-gray-600">決済時に選択</p>
                  {paymentMethod === 'both' && (
                    <div className="text-purple-600 text-sm font-medium">✓ 選択中</div>
                  )}
                </div>
              </button>
            </div>

            {/* 決済方法の説明 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2">📝 決済方法について</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {paymentMethod === 'card' && (
                  <div>
                    <p>• Visa、Mastercard、JCB、American Express対応</p>
                    <p>• 決済完了後、即座にプレミアム機能をご利用いただけます</p>
                    <p>• 自動更新でお支払いの手間がありません</p>
                  </div>
                )}
                {paymentMethod === 'konbini' && (
                  <div>
                    <p>• セブン-イレブン、ローソン、ファミリーマート等で支払い可能</p>
                    <p>• 支払い期限は3日間です</p>
                    <p>• 支払い確認後、プレミアム機能をご利用いただけます</p>
                    <p className="text-orange-600">⚠️ 単発決済のため、手動更新が必要です</p>
                  </div>
                )}
                {paymentMethod === 'both' && (
                  <div>
                    <p>• 決済画面でクレジットカードまたはコンビニ決済を選択できます</p>
                    <p>• クレジットカードの場合は自動更新、コンビニの場合は単発決済</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 