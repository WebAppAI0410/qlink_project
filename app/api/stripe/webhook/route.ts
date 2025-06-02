import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {  apiVersion: '2025-04-30.basil',});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        if (session.mode === 'subscription') {
          // サブスクリプション情報をデータベースに保存
          const { error } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: session.metadata?.userId,
              plan_id: session.metadata?.planId,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
              stripe_subscription_id: session.subscription,
            });

          if (error) {
            console.error('サブスクリプション保存エラー:', error);
          }

          // 決済履歴を保存
          await supabase
            .from('payment_history')
            .insert({
              user_id: session.metadata?.userId,
              amount: session.amount_total || 0,
              currency: session.currency?.toUpperCase() || 'JPY',
              payment_method: 'stripe',
              status: 'completed',
              stripe_payment_intent_id: session.payment_intent,
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        // サブスクリプション情報を更新
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('サブスクリプション更新エラー:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // サブスクリプションを無効化
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('サブスクリプション削除エラー:', error);
        }
        break;
      }

      default:
        console.log(`未処理のイベントタイプ: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook処理エラー:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 