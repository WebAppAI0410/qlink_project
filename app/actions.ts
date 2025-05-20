"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { createQuestion, updateQuestionStatus, setQuestionBestAnswer } from "@/utils/questions";
import { createAnonymousAnswer, toggleAnswerVisibility } from "@/utils/answers";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await nextHeaders()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await nextHeaders()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const signInWithSocialProvider = async (
  formData: FormData
) => {
  const provider = formData.get("provider") as "google" | "twitter";
  const supabase = await createClient();
  const origin = (await nextHeaders()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect(data.url);
};

// プロフィール更新アクション
export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "ログインが必要です");
  }
  
  const username = formData.get("username")?.toString();
  const displayName = formData.get("display_name")?.toString() || null;
  
  // ユーザー名の検証
  if (!username || username.length < 3) {
    return encodedRedirect("error", "/protected/profile", "ユーザー名は3文字以上必要です");
  }
  
  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
    })
    .eq("id", user.id);
  
  if (error) {
    if (error.code === "23505") { // 一意性制約違反エラーコード
      return encodedRedirect("error", "/protected/profile", "このユーザー名は既に使用されています");
    }
    console.error(error);
    return encodedRedirect("error", "/protected/profile", "プロフィールの更新に失敗しました");
  }
  
  return encodedRedirect("success", "/protected/profile", "プロフィールを更新しました");
};

// 質問作成アクション
export const createQuestionAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "ログインが必要です");
  }
  
  const content = formData.get("content")?.toString();
  
  if (!content || content.trim().length === 0) {
    return encodedRedirect("error", "/protected/questions/new", "質問内容を入力してください");
  }
  
  if (content.length > 1000) { // 文字数制限
    return encodedRedirect("error", "/protected/questions/new", "質問内容は1000文字以下にしてください");
  }
  
  const question = await createQuestion(content, user.id);
  
  if (!question) {
    return encodedRedirect("error", "/protected/questions/new", "質問の作成に失敗しました");
  }
  
  return redirect(`/protected/questions/${question.id}`);
};

// 質問ステータス更新アクション
export const updateQuestionStatusAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "ログインが必要です");
  }
  
  const questionId = formData.get("question_id")?.toString();
  const isOpen = formData.get("is_open") === "true";
  const returnUrl = formData.get("return_url")?.toString() || `/protected/questions/${questionId}`;
  
  if (!questionId) {
    return encodedRedirect("error", returnUrl, "質問IDが必要です");
  }
  
  const question = await updateQuestionStatus(questionId, isOpen);
  
  if (!question) {
    return encodedRedirect("error", returnUrl, "質問ステータスの更新に失敗しました");
  }
  
  return encodedRedirect("success", returnUrl, `質問を${isOpen ? '回答募集中' : '締め切り'}に設定しました`);
};

// ベストアンサー設定アクション
export const setBestAnswerAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "ログインが必要です");
  }
  
  const questionId = formData.get("question_id")?.toString();
  const answerId = formData.get("answer_id")?.toString();
  const returnUrl = formData.get("return_url")?.toString() || `/protected/questions/${questionId}`;
  
  if (!questionId || !answerId) {
    return encodedRedirect("error", returnUrl, "質問IDと回答IDが必要です");
  }
  
  const question = await setQuestionBestAnswer(questionId, answerId);
  
  if (!question) {
    return encodedRedirect("error", returnUrl, "ベストアンサーの設定に失敗しました");
  }
  
  return encodedRedirect("success", returnUrl, "ベストアンサーを設定しました");
};

// 匿名回答投稿アクション
export const createAnonymousAnswerAction = async (formData: FormData) => {
  const content = formData.get("content")?.toString();
  const questionId = formData.get("question_id")?.toString();
  const shortId = formData.get("short_id")?.toString();
  
  if (!content || content.trim().length === 0) {
    return encodedRedirect("error", `/q/${shortId}`, "回答内容を入力してください");
  }
  
  if (!questionId) {
    return encodedRedirect("error", `/q/${shortId}`, "質問IDが必要です");
  }
  
  if (content.length > 500) { // 文字数制限
    return encodedRedirect("error", `/q/${shortId}`, "回答内容は500文字以下にしてください");
  }
  
  // IPアドレスを取得（オプション） - Server Actions内では直接取得が難しいため一旦コメントアウト
  // const headersList = await nextHeaders(); 
  // const ip = headersList.get("x-forwarded-for") || "unknown";
  const ip = "unknown"; // 一時的にunknownで設定
  
  const answer = await createAnonymousAnswer(content, questionId, ip);
  
  if (!answer) {
    return encodedRedirect("error", `/q/${shortId}`, "回答の投稿に失敗しました");
  }
  
  return encodedRedirect("success", `/q/${shortId}/thanks`, "回答を投稿しました。ありがとうございます！");
};

// 回答表示設定アクション
export const toggleAnswerVisibilityAction = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return encodedRedirect("error", "/sign-in", "ログインが必要です");
  }
  
  const answerId = formData.get("answer_id")?.toString();
  const isHidden = formData.get("is_hidden") === "true";
  const questionId = formData.get("question_id")?.toString();
  const returnUrl = formData.get("return_url")?.toString() || `/protected/questions/${questionId}`;
  
  if (!answerId) {
    return encodedRedirect("error", returnUrl, "回答IDが必要です");
  }
  
  const answer = await toggleAnswerVisibility(answerId, isHidden);
  
  if (!answer) {
    return encodedRedirect("error", returnUrl, "回答表示設定の更新に失敗しました");
  }
  
  return encodedRedirect("success", returnUrl, `回答を${isHidden ? '非表示' : '表示'}に設定しました`);
};
