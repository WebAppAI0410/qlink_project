// Next.js アプリケーション用環境変数管理

export const ENV = {
  // Supabase設定
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bescdalknyjugpdorfay.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Stripe決済設定（クライアント側）
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // アプリケーション設定
  APP_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;

// サーバー側専用の環境変数
export const SERVER_ENV = {
  // Stripe決済設定（サーバー側）
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Supabase設定（サーバー側）
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // OAuth認証設定
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID || '',
  TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET || '',
  
  // アプリケーション設定
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // 外部API設定
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // 配送業者API設定（代引き決済用）
  YAMATO_API_KEY: process.env.YAMATO_API_KEY || '',
  YAMATO_CUSTOMER_CODE: process.env.YAMATO_CUSTOMER_CODE || '',
  SAGAWA_API_KEY: process.env.SAGAWA_API_KEY || '',
  SAGAWA_CUSTOMER_CODE: process.env.SAGAWA_CUSTOMER_CODE || '',
} as const;

// 環境変数の検証
export const validateEnv = () => {
  const missingVars: string[] = [];
  
  // 必須の環境変数をチェック
  if (!ENV.SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  // 決済機能に必要な環境変数（Stripe）
  if (!ENV.STRIPE_PUBLISHABLE_KEY) missingVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (typeof window === 'undefined') { // サーバー側でのみチェック
    if (!SERVER_ENV.STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};

// 開発環境での環境変数状況を表示
export const logEnvStatus = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 環境変数設定状況:');
    console.log('Supabase URL:', ENV.SUPABASE_URL);
    console.log('Supabase Anon Key:', ENV.SUPABASE_ANON_KEY ? '[設定済み]' : '[未設定]');
    console.log('Stripe Publishable Key:', ENV.STRIPE_PUBLISHABLE_KEY ? '[設定済み]' : '[未設定]');
    console.log('App URL:', ENV.APP_URL);
    
    if (typeof window === 'undefined') {
      console.log('Stripe Secret Key:', SERVER_ENV.STRIPE_SECRET_KEY ? '[設定済み]' : '[未設定]');
      console.log('Stripe Webhook Secret:', SERVER_ENV.STRIPE_WEBHOOK_SECRET ? '[設定済み]' : '[未設定]');
    }
    
    const validation = validateEnv();
    if (!validation.isValid) {
      console.warn('⚠️ 不足している環境変数:', validation.missingVars);
    } else {
      console.log('✅ すべての必須環境変数が設定されています');
    }
  }
};

// 型安全な環境変数アクセス
export const getEnv = (key: keyof typeof ENV) => ENV[key];
export const getServerEnv = (key: keyof typeof SERVER_ENV) => SERVER_ENV[key]; 