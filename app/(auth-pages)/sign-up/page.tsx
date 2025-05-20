import { signUpAction, signInWithSocialProvider } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButton } from "@/components/ui/social-login-button";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">新規登録</h1>
        <p className="text-sm text text-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            ログイン
          </Link>
        </p>
        
        {/* ソーシャルログインセクション */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="grid grid-cols-1 gap-2">
            <form action={signInWithSocialProvider}>
              <input type="hidden" name="provider" value="google" />
              <SocialLoginButton provider="google">
                Googleで登録
              </SocialLoginButton>
            </form>
            
            <form action={signInWithSocialProvider}>
              <input type="hidden" name="provider" value="twitter" />
              <SocialLoginButton provider="twitter">
                Xで登録
              </SocialLoginButton>
            </form>
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
        
        {/* メールアドレスでの登録 */}
        <form action={signUpAction} className="flex flex-col gap-2 [&>input]:mb-3 mt-4">
          <Label htmlFor="email">メールアドレス</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">パスワード</Label>
          <Input
            type="password"
            name="password"
            placeholder="パスワード"
            minLength={6}
            required
          />
          <SubmitButton pendingText="登録中...">
            登録する
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
      <SmtpMessage />
    </>
  );
}
