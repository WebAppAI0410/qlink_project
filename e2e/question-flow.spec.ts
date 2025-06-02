import { test, expect } from '@playwright/test'

test.describe('Question Flow', () => {
  // テスト用の認証済みコンテキストを作成
  test.use({
    storageState: 'e2e/.auth/user.json'
  })

  test.beforeEach(async ({ page }) => {
    // 認証済みユーザーとしてログイン（実際のE2Eテストでは事前にセットアップが必要）
    // ここではモックとして扱う
  })

  test('should create a new question', async ({ page }) => {
    await page.goto('/protected/questions/new')
    
    // 質問フォームが表示されることを確認
    await expect(page.getByLabel(/質問内容/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /質問を作成/i })).toBeVisible()
    
    // 質問を入力
    await page.getByLabel(/質問内容/i).fill('これはテスト質問です。どう思いますか？')
    
    // 質問を作成
    await page.getByRole('button', { name: /質問を作成/i }).click()
    
    // 質問詳細ページに遷移したことを確認
    await expect(page).toHaveURL(/\/protected\/questions\/[a-zA-Z0-9-]+/)
    await expect(page.getByText('これはテスト質問です')).toBeVisible()
  })

  test('should show character limit for free users', async ({ page }) => {
    await page.goto('/protected/questions/new')
    
    // 長い質問を入力
    const longText = 'あ'.repeat(201)
    await page.getByLabel(/質問内容/i).fill(longText)
    
    // 文字数制限の警告が表示されることを確認
    await expect(page.getByText(/200文字/i)).toBeVisible()
  })

  test('should copy share link', async ({ page }) => {
    // 既存の質問ページに移動（実際のテストではテストデータが必要）
    await page.goto('/protected/questions/test-question-id')
    
    // シェアリンクをコピーボタンをクリック
    await page.getByRole('button', { name: /リンクをコピー/i }).click()
    
    // コピー成功のメッセージが表示されることを確認
    await expect(page.getByText(/コピーしました/i)).toBeVisible()
  })

  test('should close question', async ({ page }) => {
    await page.goto('/protected/questions/test-question-id')
    
    // 質問を締め切るボタンをクリック
    await page.getByRole('button', { name: /質問を締め切る/i }).click()
    
    // 確認ダイアログが表示されることを確認
    await expect(page.getByText(/本当に締め切りますか/i)).toBeVisible()
    
    // 確認
    await page.getByRole('button', { name: /締め切る/i }).click()
    
    // 締め切り済みの表示を確認
    await expect(page.getByText(/締め切り済み/i)).toBeVisible()
  })
})