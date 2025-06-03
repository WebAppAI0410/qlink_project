import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { SERVER_ENV } from '@/utils/env';
import { getAppUrl } from '@/utils/env-helpers';

// Stripeキーが設定されていない場合はダミーキーを使用（開発環境用）
const stripeKey = SERVER_ENV.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';

const stripe = new Stripe(stripeKey, {  
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Stripeキーが設定されていない場合はエラーを返す
    if (stripeKey === 'sk_test_dummy_key_for_build') {
      return NextResponse.json(
        { error: 'Stripe APIキーが設定されていません。環境変数を確認してください。' },
        { status: 500 }
      );
    }

    const { planId, billingCycle, paymentMethod = 'card' } = await request.json();

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // プランの詳細を取得
    const { data: plan, error: planError } = await supabase
      .from('premium_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 価格を決定
    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const interval = billingCycle === 'yearly' ? 'year' : 'month';

    // 決済方法の設定
    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card'];
    let mode: 'subscription' | 'payment' = 'subscription';
    
    // コンビニ決済の場合は単発決済として処理
    if (paymentMethod === 'konbini') {
      paymentMethodTypes = ['konbini'];
      mode = 'payment';
    } else if (paymentMethod === 'both') {
      paymentMethodTypes = ['card', 'konbini'];
      mode = 'subscription'; // カード決済優先
    }

    // Stripe Checkout Session作成
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `Qlink ${plan.name}プラン`,
              description: plan.features.join(', '),
            },
            unit_amount: amount,
            ...(mode === 'subscription' && {
              recurring: {
                interval: interval,
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${request.nextUrl.origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/premium`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId,
        billingCycle: billingCycle,
        paymentMethod: paymentMethod,
      },
    };

    // コンビニ決済の場合の追加設定
    if (paymentMethod === 'konbini') {
      sessionConfig.payment_method_options = {
        konbini: {
          expires_after_days: 3, // 3日間有効
        },
      };
      sessionConfig.expires_at = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60); // 3日後
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: session.id,
      paymentMethod: paymentMethod,
      mode: mode 
    });
  } catch (error: any) {
    console.error('Stripe Checkout Session作成エラー:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 