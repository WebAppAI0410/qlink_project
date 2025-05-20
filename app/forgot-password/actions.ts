'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email')?.toString()
  const supabase = await createClient()
  const origin = formData.get('origin')?.toString() || 'http://localhost:3001'
  
  if (!email) {
    return redirect('/forgot-password?error=メールアドレスを入力してください')
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/login`,
  })
  
  if (error) {
    console.error(error.message)
    return redirect('/forgot-password?error=パスワードのリセットに失敗しました')
  }
  
  return redirect('/forgot-password?message=パスワードリセットのリンクを送信しました。メールをご確認ください')
} 