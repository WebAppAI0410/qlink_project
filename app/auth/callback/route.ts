import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs

  // コールバックのデバッグ情報をログに出力
  console.log("auth/callback処理を開始します");
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  
  console.log("コールバックパラメータ:", {
    origin,
    hasCode: !!code,
    redirectTo: redirectTo || "未指定",
    url: request.url
  });
  
  // エラー処理
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.searchParams.get("error_code");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    console.error("認証エラー:", { error, errorCode, errorDescription });
    
    // エラーページにリダイレクト
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  let isNewUser = false;
  
  if (code) {
    try {
      console.log("認証コードの交換を開始");
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("コード交換エラー:", exchangeError);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }
      
      console.log("コード交換成功、ユーザー情報取得");
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("ユーザー認証成功:", { id: user.id, email: user.email });
        // プロフィール情報をチェック
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) {
          console.log("プロフィール取得エラー:", profileError);
          isNewUser = true;
        } else {
          console.log("プロフィール情報:", { 
            hasProfile: !!profile,
            hasUsername: !!profile?.username
          });
          // プロフィールが存在しない、または必須項目が未設定の場合は新規ユーザーとして扱う
          isNewUser = !profile || !profile.username;
        }
      } else {
        console.error("ユーザー情報の取得に失敗");
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("認証後のユーザー情報取得に失敗しました")}`);
      }
      
    } catch (err: any) {
      console.error("セッション処理エラー:", err);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(err?.message || '不明なエラー')}`
      );
    }
  } else {
    console.error("認証コードがありません");
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("認証コードがありません")}`);
  }

  // 新規ユーザーの場合はオンボーディングページにリダイレクト
  if (isNewUser) {
    console.log("新規ユーザー、オンボーディングページへリダイレクト");
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (redirectTo) {
    console.log(`指定されたリダイレクト先に転送: ${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // ダッシュボードにリダイレクト
  console.log("認証完了、ダッシュボードへリダイレクト");
  return NextResponse.redirect(`${origin}/dashboard`);
}
