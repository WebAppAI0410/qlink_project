import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/lib/types";

// ユーザープロフィール情報を取得する関数
export async function getUserProfile() {
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }
  
  // ユーザーのプロフィール情報を取得
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profileError) {
    console.error("プロフィール情報取得エラー:", profileError);
    return null;
  }
  
  return {
    user,
    profile: profile as Profile
  };
}

// プロフィール情報をusernameから取得する関数
export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    console.error("ユーザー名からのプロフィール情報取得エラー:", error);
    return null;
  }
  
  return profile as Profile;
}

// ユーザーIDからプロフィール情報を取得する関数
export async function getProfileById(id: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("IDからのプロフィール情報取得エラー:", error);
    return null;
  }
  
  return profile as Profile;
} 