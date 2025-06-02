import { createClient } from "./server";

// この関数はNext.jsのAPI Routeから呼び出される想定です
export async function handleAuthHook(payload: {
  type: 'AUTH_SIGNUP' | 'AUTH_SIGNIN' | string;
  event: 'SIGNED_IN' | 'SIGNED_UP' | 'SIGNED_OUT' | 'PASSWORD_RECOVERY' | 'USER_DELETED' | string;
  user: {
    id: string;
    email?: string;
    app_metadata: {
      provider: string;
    };
    user_metadata: Record<string, any>;
  };
}) {
  try {
    console.log('Auth webhook received:', JSON.stringify(payload, null, 2));
    
    if (payload.event === 'SIGNED_UP' || payload.event === 'SIGNED_IN') {
      const supabase = await createClient();
      
      // ユーザーがプロフィールを持っているかチェック
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', payload.user.id)
        .single();
      
      // プロフィールが存在しない場合は作成
      if (!existingProfile) {
        console.log(`Creating new profile for user: ${payload.user.id}`);
        
        // メールのユーザー名部分を取得（仮のユーザー名として）
        const emailPrefix = payload.user.email 
          ? payload.user.email.split('@')[0] 
          : `user_${Date.now().toString().slice(-6)}`;
        
        // Auth プロバイダを取得
        const provider = payload.user.app_metadata.provider;
        
        // プロフィール作成
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: payload.user.id,
            username: `${emailPrefix}_${Date.now().toString().slice(-4)}`,
            display_name: payload.user.user_metadata.full_name || null,
            auth_source: provider,
            is_premium: false,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log(`Profile already exists for user: ${payload.user.id}`);
      }
    }
    
    return { statusCode: 200, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('Error processing auth webhook:', error);
    return { statusCode: 500, message: 'Error processing webhook' };
  }
} 