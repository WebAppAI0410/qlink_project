import { getUserProfile } from "@/utils/user";
import { updateProfileAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { redirect } from "next/navigation";
import { ProfileImageUpload } from "@/components/profile-image-upload";

export default async function ProfilePage(props: {
  searchParams: Promise<Message>;
}) {
  const userData = await getUserProfile();
  const searchParams = await props.searchParams;
  
  // ユーザーがログインしていない場合はログインページにリダイレクト
  if (!userData) {
    redirect("/login");
  }
  
  const { user, profile } = userData;
  
  return (
    <div className="container max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        {searchParams.message && (
          <div className="mb-6">
            <FormMessage message={searchParams} />
          </div>
        )}
        
        <div className="mb-6">
          <ProfileImageUpload 
            userId={user.id} 
            currentImageUrl={profile?.profile_pic_url} 
          />
        </div>

        <form action={updateProfileAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" value={user.email || ''} disabled />
            <p className="text-xs text-muted-foreground">メールアドレスは変更できません</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名 (必須)</Label>
            <Input 
              id="username" 
              name="username" 
              placeholder="username" 
              defaultValue={profile?.username || ''} 
              required 
              minLength={3}
            />
            <p className="text-xs text-muted-foreground">
              ユーザー名は公開され、URLに使用されます（3文字以上）
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="display_name">表示名</Label>
            <Input 
              id="display_name" 
              name="display_name" 
              placeholder="表示名" 
              defaultValue={profile?.display_name || ''}
            />
            <p className="text-xs text-muted-foreground">
              表示名は公開プロフィールに表示されます（省略可）
            </p>
          </div>
          
          <SubmitButton pendingText="更新中...">プロフィールを更新</SubmitButton>
        </form>
      </div>
    </div>
  );
} 