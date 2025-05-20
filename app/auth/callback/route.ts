import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  
  // エラー処理
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    console.error("認証エラー:", { error, errorCode, errorDescription });
    
    // エラーページにリダイレクト
    return NextResponse.redirect(
      `${origin}/sign-in?authError=${encodeURIComponent(errorDescription || error)}`
    );
  }

  let isNewUser = false;
  
  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("コード交換エラー:", exchangeError);
        return NextResponse.redirect(
          `${origin}/sign-in?authError=${encodeURIComponent(exchangeError.message)}`
        );
      }
      
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // プロフィール情報をチェック
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        // プロフィールが存在しない、または必須項目が未設定の場合は新規ユーザーとして扱う
        isNewUser = !profile || !profile.username;
      }
      
    } catch (err: any) {
      console.error("セッション処理エラー:", err);
      return NextResponse.redirect(
        `${origin}/sign-in?authError=${encodeURIComponent(err?.message || '不明なエラー')}`
      );
    }
  }

  // 新規ユーザーの場合はプロフィール設定ページにリダイレクト
  if (isNewUser) {
    return NextResponse.redirect(`${origin}/protected/profile?message=${encodeURIComponent(JSON.stringify({
      type: 'info',
      message: 'プロフィールを設定してください'
    }))}`);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
