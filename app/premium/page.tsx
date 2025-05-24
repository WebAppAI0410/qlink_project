'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePremium } from '@/lib/hooks/use-premium';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap, Shield, BarChart3 } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export default function PremiumPage() {
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const supabase = createClient();
  
  const { isPremium, subscription, plan: currentPlan } = usePremium(user);

  useEffect(() => {
    fetchUser();
    fetchPlans();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0].id);
      }
    } catch (error) {
      console.error('プラン取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // TODO: Stripe Checkout Session作成
    console.log('サブスクリプション開始:', { planId, billingCycle });
    alert('決済機能は実装中です。しばらくお待ちください。');
  };

    const featureIcons = {    '広告非表示': <Shield className="w-5 h-5 text-green-500" />,    '質問文字数制限緩和 (100文字→1,000文字)': <Zap className="w-5 h-5 text-blue-500" />,    '回答文字数制限緩和 (500文字→2,000文字)': <Zap className="w-5 h-5 text-blue-500" />,    '質問アナリティクス機能': <BarChart3 className="w-5 h-5 text-orange-500" />,    'お友達紹介プログラム': <Crown className="w-5 h-5 text-purple-500" />,    'プロフィールカスタマイズ強化': <Crown className="w-5 h-5 text-purple-500" />,    '高度な検索機能': <Zap className="w-5 h-5 text-blue-500" />,    'プレミアムバッジ表示': <Crown className="w-5 h-5 text-yellow-500" />  };

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
            広告なしで快適に、さらに多くの機能でQlinkを最大限活用しよう
          </p>
        </div>

        {/* 現在のプレミアム状態 */}
        {isPremium && (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl p-6 mb-8 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-2">プレミアム会員です！</h2>
            <p className="opacity-90">
              現在のプラン: {currentPlan?.name} | 
              有効期限: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('ja-JP') : '不明'}
            </p>
          </div>
        )}

        {/* 料金サイクル選択 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              月額プラン
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              年額プラン
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                お得
              </span>
            </button>
          </div>
        </div>

                {/* プラン一覧 */}        <div className="flex justify-center">          <div className="max-w-md">          {plans.map((plan, index) => {            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;            const monthlyPrice = billingCycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;            const isPopular = true; // 単一プランなので人気プランとして表示

            return (
              <div
                key={plan.id}
                className={`
                  relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-200
                  ${isPopular ? 'ring-2 ring-blue-500 scale-105' : 'hover:shadow-2xl hover:scale-105'}
                `}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      人気プラン
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ¥{monthlyPrice.toLocaleString()}
                    <span className="text-lg text-gray-500">/月</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 font-medium">
                      年額 ¥{price.toLocaleString()} (2ヶ月分お得)
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
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isPremium && currentPlan?.id === plan.id}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                    ${isPremium && currentPlan?.id === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isPopular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-800 text-white hover:bg-gray-900 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {isPremium && currentPlan?.id === plan.id
                    ? '現在のプラン'
                    : `${plan.name}プランを始める`
                  }
                </button>
              </div>
                        );          })}        </div>        </div>

                {/* 機能比較表 */}        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">機能比較</h2>          <div className="overflow-x-auto">            <table className="w-full">              <thead>                <tr className="border-b-2 border-gray-200">                  <th className="text-left py-4 px-6 font-bold text-gray-800">機能</th>                  <th className="text-center py-4 px-6 font-bold text-gray-800">無料</th>                  <th className="text-center py-4 px-6 font-bold text-blue-600">プレミアム</th>                </tr>              </thead>              <tbody className="divide-y divide-gray-200">                <tr>                  <td className="py-4 px-6">質問文字数</td>                  <td className="text-center py-4 px-6">100字</td>                  <td className="text-center py-4 px-6 text-blue-600 font-medium">1,000字</td>                </tr>                <tr>                  <td className="py-4 px-6">回答文字数</td>                  <td className="text-center py-4 px-6">500字</td>                  <td className="text-center py-4 px-6 text-blue-600 font-medium">2,000字</td>                </tr>                <tr>                  <td className="py-4 px-6">広告表示</td>                  <td className="text-center py-4 px-6">あり</td>                  <td className="text-center py-4 px-6 text-blue-600 font-medium">なし</td>                </tr>                <tr>                  <td className="py-4 px-6">アナリティクス</td>                  <td className="text-center py-4 px-6">-</td>                  <td className="text-center py-4 px-6 text-blue-600 font-medium">✓</td>                </tr>                <tr>                  <td className="py-4 px-6">お友達紹介</td>                  <td className="text-center py-4 px-6">-</td>                  <td className="text-center py-4 px-6 text-blue-600 font-medium">✓</td>                </tr>
                <tr>
                  <td className="py-4 px-6">アナリティクス</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6 text-purple-600 font-medium">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">よくある質問</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">いつでもキャンセルできますか？</h3>
              <p className="text-gray-600">はい、いつでもキャンセル可能です。次回の請求日まで機能をご利用いただけます。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">支払い方法は？</h3>
              <p className="text-gray-600">クレジットカード、デビットカード、コンビニ決済、銀行振込に対応しています。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 