import { test, expect } from '@playwright/test'

test.describe('인증 페이지', () => {
  test('로그인 페이지 로드', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('로그인 페이지에 네비바 없음', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('nav')).not.toBeVisible()
  })

  test('로고 클릭 시 홈으로 이동', async ({ page }) => {
    await page.goto('/login')
    await page.getByAltText('TAT for Animals').click()
    await expect(page).toHaveURL('/')
  })

  test('잘못된 로그인 시 에러 표시', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill('wrong@email.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText("doesn't match our records")).toBeVisible()
  })

  test('비밀번호 없이 로그인 전환', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('Sign in without a password').click()
    await expect(page.getByText('Sign in without a password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send me a sign-in link' })).toBeVisible()
  })
})

test.describe('회원가입 페이지', () => {
  test('회원가입 페이지 로드', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('Create your account')).toBeVisible()
  })
})

test.describe('비밀번호 재설정', () => {
  test('재설정 페이지 로드', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.getByText('Forgot your password?')).toBeVisible()
  })
})
