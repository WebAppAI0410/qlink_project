import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// デフォルト値として環境変数を使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bescdalknyjugpdorfay.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2NkYWxrbnlqdWdwZG9yZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzAyMDMsImV4cCI6MjA2MzI0NjIwM30.i--EX-fL516pVKDX7hEQZ4RZQvKIgUKzOhz4bfkx-Dk';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name, options);
          } catch (error) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  );
}
