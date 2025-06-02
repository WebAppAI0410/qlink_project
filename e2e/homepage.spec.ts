import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage with correct title', async ({ page }) => {
    await page.goto('/')
    
    // タイトルを確認
    await expect(page).toHaveTitle(/Qlink/)
    
    // ヘッダーが表示されていることを確認
    await expect(page.locator('header')).toBeVisible()
    
    // ログインボタンが表示されていることを確認
    await expect(page.getByRole('link', { name: /ログイン/i })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    // ログインリンクをクリック
    await page.getByRole('link', { name: /ログイン/i }).click()
    
    // ログインページに遷移したことを確認
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    
    // テーマ切り替えボタンを探す
    const themeButton = page.getByRole('button', { name: /テーマを切り替える/i })
    await expect(themeButton).toBeVisible()
    
    // 初期状態を確認（HTMLのclass属性）
    const htmlElement = page.locator('html')
    const initialTheme = await htmlElement.getAttribute('class')
    
    // テーマを切り替える
    await themeButton.click()
    await page.getByRole('menuitem', { name: /ダーク/i }).click()
    
    // テーマが変更されたことを確認
    await expect(htmlElement).toHaveClass(/dark/)
  })

  test('should show premium features section', async ({ page }) => {
    await page.goto('/')
    
    // プレミアム機能の説明が表示されていることを確認
    await expect(page.getByText(/プレミアム/i)).toBeVisible()
  })
})