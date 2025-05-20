'use server';

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// プロフィール更新アクション
export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login?error=ログインが必要です');
  }
  
  const username = formData.get("username")?.toString();
  const displayName = formData.get("display_name")?.toString() || null;
  
  // ユーザー名の検証
  if (!username || username.length < 3) {
    return redirect('/protected/profile?error=ユーザー名は3文字以上必要です');
  }
  
  // プロフィールが存在するか確認
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();
  
  let error;
  
  if (existingProfile) {
    // 既存のプロフィールを更新
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName,
      })
      .eq("id", user.id);
      
    error = updateError;
  } else {
    // 新しいプロフィールを作成
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        display_name: displayName,
      });
      
    error = insertError;
  }
  
  if (error) {
    if (error.code === "23505") { // 一意性制約違反エラーコード
      return redirect('/protected/profile?error=このユーザー名は既に使用されています');
    }
    console.error(error);
    return redirect('/protected/profile?error=プロフィールの更新に失敗しました');
  }
  
  revalidatePath('/protected/profile');
  return redirect('/protected/profile?success=プロフィールを更新しました');
};

// 質問作成アクション
export const createQuestionAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login?error=ログインが必要です');
  }
  
  const content = formData.get("content")?.toString();
  
  if (!content || content.trim().length === 0) {
    return redirect('/protected/questions/new?error=質問内容を入力してください');
  }
  
  if (content.length > 1000) { // 文字数制限
    return redirect('/protected/questions/new?error=質問内容は1000文字以下にしてください');
  }
  
  // short_idをランダムに生成
  const shortId = generateShortId(7);
  
  // 質問を作成
  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      content,
      user_id: user.id,
      short_id: shortId
    })
    .select()
    .single();
  
  if (error) {
    console.error(error);
    return redirect('/protected/questions/new?error=質問の作成に失敗しました');
  }
  
  return redirect(`/protected/questions/${question.id}`);
};

// 質問ステータス更新アクション
export const updateQuestionStatusAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login?error=ログインが必要です');
  }
  
  const questionId = formData.get("question_id")?.toString();
  const isOpen = formData.get("is_open") === "true";
  
  if (!questionId) {
    return redirect('/dashboard?error=質問IDが必要です');
  }
  
  // 質問の所有者を確認
  const { data: question } = await supabase
    .from("questions")
    .select()
    .eq("id", questionId)
    .single();
  
  if (!question || question.user_id !== user.id) {
    return redirect('/dashboard?error=この操作を行う権限がありません');
  }
  
  // 質問のステータスを更新
  const { error } = await supabase
    .from("questions")
    .update({ is_open: isOpen })
    .eq("id", questionId);
  
  if (error) {
    console.error(error);
    return redirect(`/protected/questions/${questionId}?error=質問ステータスの更新に失敗しました`);
  }
  
  revalidatePath(`/protected/questions/${questionId}`);
  return redirect(`/protected/questions/${questionId}?success=質問を${isOpen ? '募集中' : '締め切り'}に設定しました`);
};

// ベストアンサー設定アクション
export const setBestAnswerAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login?error=ログインが必要です');
  }
  
  const questionId = formData.get("question_id")?.toString();
  const answerId = formData.get("answer_id")?.toString();
  
  if (!questionId || !answerId) {
    return redirect('/dashboard?error=質問IDと回答IDが必要です');
  }
  
  // 質問の所有者を確認
  const { data: question } = await supabase
    .from("questions")
    .select()
    .eq("id", questionId)
    .single();
  
  if (!question || question.user_id !== user.id) {
    return redirect('/dashboard?error=この操作を行う権限がありません');
  }
  
  // ベストアンサーを設定
  const { error } = await supabase
    .from("questions")
    .update({ best_answer_id: answerId })
    .eq("id", questionId);
  
  if (error) {
    console.error(error);
    return redirect(`/protected/questions/${questionId}?error=ベストアンサーの設定に失敗しました`);
  }
  
  revalidatePath(`/protected/questions/${questionId}`);
  return redirect(`/protected/questions/${questionId}?success=ベストアンサーを設定しました`);
};

// 匿名回答作成アクション
export const createAnonymousAnswerAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  const content = formData.get("content")?.toString();
  const questionId = formData.get("question_id")?.toString();
  const shortId = formData.get("short_id")?.toString();
  
  if (!content || content.trim().length === 0) {
    return redirect(`/q/${shortId}?error=回答内容を入力してください`);
  }
  
  if (content.length > 1000) { // 文字数制限
    return redirect(`/q/${shortId}?error=回答内容は1000文字以下にしてください`);
  }
  
  if (!questionId || !shortId) {
    return redirect(`/q/${shortId}?error=質問情報が不足しています`);
  }
  
  // 質問が存在し、回答受付中か確認
  const { data: question } = await supabase
    .from("questions")
    .select()
    .eq("id", questionId)
    .eq("is_open", true)
    .single();
  
  if (!question) {
    return redirect(`/q/${shortId}?error=この質問は存在しないか、締め切られています`);
  }
  
  // 回答用のshort_idを生成
  const answerShortId = generateShortId(7);
  
  // 回答を作成
  const { error } = await supabase
    .from("answers")
    .insert({
      content,
      question_id: questionId,
      short_id: answerShortId,
      ip_address: '0.0.0.0' // 実際の実装ではIPアドレスを取得するロジックが必要
    });
  
  if (error) {
    console.error(error);
    return redirect(`/q/${shortId}?error=回答の投稿に失敗しました`);
  }
  
  return redirect(`/q/${shortId}/thanks`);
};

// 回答の表示/非表示切り替えアクション
export const toggleAnswerVisibilityAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login?error=ログインが必要です');
  }
  
  const answerId = formData.get("answer_id")?.toString();
  const isHidden = formData.get("is_hidden") === "true";
  const questionId = formData.get("question_id")?.toString();
  
  if (!answerId || !questionId) {
    return redirect('/dashboard?error=必要な情報が不足しています');
  }
  
  // 質問の所有者を確認
  const { data: question } = await supabase
    .from("questions")
    .select()
    .eq("id", questionId)
    .single();
  
  if (!question || question.user_id !== user.id) {
    return redirect('/dashboard?error=この操作を行う権限がありません');
  }
  
  // 回答の表示/非表示を切り替え
  const { error } = await supabase
    .from("answers")
    .update({ is_hidden: isHidden })
    .eq("id", answerId)
    .eq("question_id", questionId);
  
  if (error) {
    console.error(error);
    return redirect(`/protected/questions/${questionId}?error=回答の表示設定の変更に失敗しました`);
  }
  
  revalidatePath(`/protected/questions/${questionId}`);
  return redirect(`/protected/questions/${questionId}?success=回答を${isHidden ? '非表示' : '表示'}に設定しました`);
};

// ヘルパー関数: ランダムな短縮IDを生成
function generateShortId(length: number = 7): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
} 