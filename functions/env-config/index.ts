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
    SUPABASE_URL: Deno.env.get('SUPABASE_URL') || 'https://bescdalknyjugpdorfay.supabase.co',
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || '',
    // 他の必要な環境変数があればここに追加
  };
  
  // JSONレスポンスを返す
  return new Response(JSON.stringify(envVars), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}); 