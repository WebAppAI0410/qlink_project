import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// デフォルト値として環境変数を使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bescdalknyjugpdorfay.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2NkYWxrbnlqdWdwZG9yZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzAyMDMsImV4cCI6MjA2MzI0NjIwM30.i--EX-fL516pVKDX7hEQZ4RZQvKIgUKzOhz4bfkx-Dk';

export async function updateSession(request: NextRequest) {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map((cookie) => {
              return {
                name: cookie.name,
                value: cookie.value,
              };
            });
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              request.cookies.set({
                name,
                value,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            });
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    await supabase.auth.getUser();

    // リクエストURLのパス部分を取得
    const path = request.nextUrl.pathname;
    
    // 保護されたルートへのアクセスチェック
    if (path.startsWith('/protected') || path.startsWith('/dashboard')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    if (path === "/") {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    console.error('Supabaseクライアント作成エラー:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}
