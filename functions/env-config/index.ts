import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORSヘッダーを設定するための関数
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // OPTIONSリクエストに対するCORSプリフライトレスポンス
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // 環境変数を取得
  const envVars = {
    // Supabase設定
    SUPABASE_URL: Deno.env.get('SUPABASE_URL') || 'https://gahupdnnjeyfgmgbkhus.supabase.co',
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || '',
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    
    // Stripe決済設定
    STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY') || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Deno.env.get('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') || '',
    STRIPE_WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
    
    // OAuth認証設定
    GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID') || '',
    GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
    TWITTER_CLIENT_ID: Deno.env.get('TWITTER_CLIENT_ID') || '',
    TWITTER_CLIENT_SECRET: Deno.env.get('TWITTER_CLIENT_SECRET') || '',
    
    // アプリケーション設定
    NEXTAUTH_SECRET: Deno.env.get('NEXTAUTH_SECRET') || '',
    NEXTAUTH_URL: Deno.env.get('NEXTAUTH_URL') || 'http://localhost:3000',
    
    // 外部API設定（将来の拡張用）
    OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') || '',
    
    // 配送業者API設定（代引き決済用 - 将来実装）
    YAMATO_API_KEY: Deno.env.get('YAMATO_API_KEY') || '',
    YAMATO_CUSTOMER_CODE: Deno.env.get('YAMATO_CUSTOMER_CODE') || '',
    SAGAWA_API_KEY: Deno.env.get('SAGAWA_API_KEY') || '',
    SAGAWA_CUSTOMER_CODE: Deno.env.get('SAGAWA_CUSTOMER_CODE') || '',
  };
  
  // 機密情報は除外してログ出力（開発時のデバッグ用）
  const safeEnvVars = {
    SUPABASE_URL: envVars.SUPABASE_URL,
    NEXTAUTH_URL: envVars.NEXTAUTH_URL,
    // 公開キーは表示可能
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // 機密情報は存在するかどうかのみ表示
    STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY ? '[設定済み]' : '[未設定]',
    STRIPE_WEBHOOK_SECRET: envVars.STRIPE_WEBHOOK_SECRET ? '[設定済み]' : '[未設定]',
    SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? '[設定済み]' : '[未設定]',
    SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY ? '[設定済み]' : '[未設定]',
    GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID ? '[設定済み]' : '[未設定]',
    GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET ? '[設定済み]' : '[未設定]',
    TWITTER_CLIENT_ID: envVars.TWITTER_CLIENT_ID ? '[設定済み]' : '[未設定]',
    TWITTER_CLIENT_SECRET: envVars.TWITTER_CLIENT_SECRET ? '[設定済み]' : '[未設定]',
    NEXTAUTH_SECRET: envVars.NEXTAUTH_SECRET ? '[設定済み]' : '[未設定]',
    OPENAI_API_KEY: envVars.OPENAI_API_KEY ? '[設定済み]' : '[未設定]',
    YAMATO_API_KEY: envVars.YAMATO_API_KEY ? '[設定済み]' : '[未設定]',
    SAGAWA_API_KEY: envVars.SAGAWA_API_KEY ? '[設定済み]' : '[未設定]',
  };
  
  console.log('環境変数設定状況:', safeEnvVars);
  
  // JSONレスポンスを返す（実際のキーは含めない、設定状況のみ）
  return new Response(JSON.stringify(safeEnvVars), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}); 