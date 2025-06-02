import { logout } from './actions'
import { redirect } from 'next/navigation'

export default async function LogoutPage() {
  // ログアウト処理を即時実行
  return await logout()
} 