import { NextResponse } from 'next/server';
import { handleAuthHook } from '@/utils/supabase/hooks';

export const runtime = 'edge';

// Supabase Webhookからのリクエストを処理
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Webhookの検証（実際の実装では、Supabaseから送信されたWebhook署名を検証するべき）
    // ここでは簡易実装のため省略
    
    // フックハンドラーを呼び出す
    const result = await handleAuthHook(payload);
    
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { message: 'Error processing webhook' }, 
      { status: 500 }
    );
  }
} 