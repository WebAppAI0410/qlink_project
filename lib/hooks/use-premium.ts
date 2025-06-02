'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface PremiumPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  premium_plan?: PremiumPlan;
}

interface PremiumState {
  isPremium: boolean;
  subscription: UserSubscription | null;
  plan: PremiumPlan | null;
  loading: boolean;
  error: string | null;
}

export function usePremium(user: User | null) {
  const [premiumState, setPremiumState] = useState<PremiumState>({
    isPremium: false,
    subscription: null,
    plan: null,
    loading: true,
    error: null
  });

  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setPremiumState({
        isPremium: false,
        subscription: null,
        plan: null,
        loading: false,
        error: null
      });
      return;
    }

    fetchPremiumStatus();
  }, [user]);

  const fetchPremiumStatus = async () => {
    try {
      setPremiumState(prev => ({ ...prev, loading: true, error: null }));

      // ユーザーのアクティブなサブスクリプションを取得
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          premium_plan:premium_plans(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      const isPremium = !!subscription;
      const plan = subscription?.premium_plan || null;

      setPremiumState({
        isPremium,
        subscription,
        plan,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('プレミアム状態の取得エラー:', error);
      setPremiumState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'プレミアム状態の取得に失敗しました'
      }));
    }
  };

  const refreshPremiumStatus = () => {
    fetchPremiumStatus();
  };

  return {
    ...premiumState,
    refreshPremiumStatus
  };
}

// プレミアム機能の権限チェック用ヘルパー関数
export const checkPremiumFeature = (
  isPremium: boolean,
  feature: 'ad_free' | 'extended_question_length' | 'extended_answer_length' | 'hide_answers' | 'analytics'
): boolean => {
  if (!isPremium) return false;
  
  // すべてのプレミアム機能を有効にする
  // 将来的にプラン別の機能制限を実装する場合はここを変更
  return true;
};

// 文字数制限を取得する関数
export const getCharacterLimit = (
  isPremium: boolean,
  type: 'question' | 'answer'
): number => {
  if (type === 'question') {
    return isPremium ? 1000 : 100;
  } else {
    return isPremium ? 2000 : 500;
  }
}; 