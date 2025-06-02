import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    
    // フォーム要素が表示されていることを確認
    await expect(page.getByLabel(/メールアドレス/i)).toBeVisible()
    await expect(page.getByLabel(/パスワード/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible()
    
    // ソーシャルログインボタンを確認
    await expect(page.getByRole('button', { name: /Googleでログイン/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Xでログイン/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')
    
    // 空のフォームで送信
    await page.getByRole('button', { name: /ログイン/i }).click()
    
    // バリデーションエラーが表示されることを確認
    await expect(page.getByText(/メールアドレスを入力してください/i)).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login')
    
    // サインアップリンクをクリック
    await page.getByRole('link', { name: /アカウントを作成/i }).click()
    
    // サインアップページに遷移したことを確認
    await expect(page).toHaveURL('/signup')
    await expect(page.getByRole('heading', { name: /アカウント作成/i })).toBeVisible()
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login')
    
    // パスワード忘れリンクをクリック
    await page.getByRole('link', { name: /パスワードを忘れた方/i }).click()
    
    // パスワード忘れページに遷移したことを確認
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.getByRole('heading', { name: /パスワードをリセット/i })).toBeVisible()
  })

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // 無効な資格情報を入力
    await page.getByLabel(/メールアドレス/i).fill('invalid@example.com')
    await page.getByLabel(/パスワード/i).fill('wrongpassword')
    
    // ログインを試行
    await page.getByRole('button', { name: /ログイン/i }).click()
    
    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/認証情報が無効です/i)).toBeVisible()
  })
})