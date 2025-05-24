import { createClient } from '@/utils/supabase/client';

// 紹介コードで新規登録を処理する関数
export async function handleReferralSignup(referralCode: string, newUserId: string) {
  const supabase = createClient();
  
  try {
    // 紹介コードの有効性を確認
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('referral_code', referralCode)
      .single();
    
    if (referrerError || !referrer) {
      console.error('無効な紹介コード:', referralCode);
      return { success: false, error: '無効な紹介コードです' };
    }
    
    // 自分自身を紹介することを防ぐ
    if (referrer.id === newUserId) {
      return { success: false, error: '自分自身を紹介することはできません' };
    }
    
    // 重複する紹介を防ぐ
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();
    
    if (existingReferral) {
      return { success: false, error: '既に紹介済みのユーザーです' };
    }
    
    // 紹介記録を作成
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: referrer.id,
        referred_user_id: newUserId,
        referral_code: referralCode,
        referred_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('紹介記録の作成エラー:', insertError);
      return { success: false, error: '紹介記録の作成に失敗しました' };
    }
    
    return { 
      success: true, 
      message: `${referrer.username}さんの紹介で登録されました！` 
    };
  } catch (error) {
    console.error('紹介処理エラー:', error);
    return { success: false, error: '紹介処理に失敗しました' };
  }
}

// ユーザーの紹介統計を取得する関数
export async function getUserReferralStats(userId: string) {
  const supabase = createClient();
  
  try {
    // 紹介したユーザー数
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        id,
        referred_at,
        is_premium_signup,
        reward_granted,
        referred_user:profiles!referrals_referred_user_id_fkey(username, display_name)
      `)
      .eq('referrer_user_id', userId)
      .order('referred_at', { ascending: false });
    
    if (referralsError) throw referralsError;
    
    // 自分を紹介してくれたユーザー
    const { data: referredBy, error: referredByError } = await supabase
      .from('referrals')
      .select(`
        referrer_user:profiles!referrals_referrer_user_id_fkey(username, display_name),
        referred_at
      `)
      .eq('referred_user_id', userId)
      .single();
    
    // エラーは無視（紹介されていない場合は正常）
    
    const totalReferrals = referrals?.length || 0;
    const premiumReferrals = referrals?.filter(r => r.is_premium_signup).length || 0;
    const rewardsEarned = referrals?.filter(r => r.reward_granted).length || 0;
    
    return {
      totalReferrals,
      premiumReferrals,
      rewardsEarned,
      referrals: referrals || [],
      referredBy: referredBy || null
    };
  } catch (error) {
    console.error('紹介統計の取得エラー:', error);
    throw error;
  }
}

// プレミアム登録時の紹介ボーナスを処理する関数
export async function handlePremiumReferralReward(userId: string) {
  const supabase = createClient();
  
  try {
    // このユーザーを紹介した人を確認
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .single();
    
    if (referralError || !referral) {
      // 紹介されていないユーザーの場合は何もしない
      return { success: true, noReferral: true };
    }
    
    // プレミアム登録フラグを更新
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        is_premium_signup: true,
        reward_granted: true
      })
      .eq('id', referral.id);
    
    if (updateError) throw updateError;
    
    // 紹介者に1ヶ月無料のプレミアム期間を付与
    // (実際の実装では、サブスクリプション期間の延長処理を行う)
    
    return { 
      success: true, 
      referrerId: referral.referrer_user_id,
      message: '紹介ボーナスが付与されました'
    };
  } catch (error) {
    console.error('紹介ボーナス処理エラー:', error);
    return { success: false, error: '紹介ボーナス処理に失敗しました' };
  }
} 