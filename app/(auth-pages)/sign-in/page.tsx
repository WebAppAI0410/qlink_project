import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginForm } from "@/components/social-login-form";
import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default async function Login(props: { 
  searchParams: Promise<Message & { authError?: string }> 
}) {
  const searchParams = await props.searchParams;
  const authError = searchParams.authError;
  
  return (
    <div className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">ログイン</h1>
      <p className="text-sm text-foreground">
        アカウントをお持ちでない場合は{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          新規登録
        </Link>
      </p>
      
      {authError && (
        <Alert className="mt-4 bg-red-50 text-red-800 border-red-200">
          <AlertTitle>認証エラー</AlertTitle>
          <AlertDescription>{decodeURIComponent(authError)}</AlertDescription>
        </Alert>
      )}
      
      {/* ソーシャルログインセクション */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="grid grid-cols-1 gap-2">
          <SocialLoginForm provider="google" />
          <SocialLoginForm provider="twitter" />
        </div>
        
        {/* 区切り線 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              または
            </span>
          </div>
        </div>
      </div>
      
      {/* 従来のメールログイン */}
      <form action={signInAction} className="flex flex-col gap-2 [&>input]:mb-3 mt-4">
        <Label htmlFor="email">メールアドレス</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">パスワード</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            パスワードをお忘れですか？
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          required
        />
        <SubmitButton pendingText="ログイン中...">
          ログイン
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
