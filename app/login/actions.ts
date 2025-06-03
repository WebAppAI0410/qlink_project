'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCallbackUrl } from '@/utils/env-helpers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cookieStore = await cookies()
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }
  
  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cookieStore = await cookies()
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getCallbackUrl(),
    },
  })
  
  if (error) {
    return redirect('/signup?error=' + encodeURIComponent(error.message))
  }
  
  return redirect('/login?message=確認メールを送信しました。メールをご確認ください。')
} 