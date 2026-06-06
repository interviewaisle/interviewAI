import { test, expect } from '@playwright/test'

const TOKEN_KEY = 'interviewai_token'

test.beforeEach(async ({ page }) => {
  // Start each test with no stored token
  await page.goto('/')
  await page.evaluate((key) => localStorage.removeItem(key), TOKEN_KEY)
})

// ---------------------------------------------------------------------------
// Redirects
// ---------------------------------------------------------------------------

test('/ redirects to /login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('/tracks redirects to /login when no token is stored', async ({ page }) => {
  await page.goto('/tracks')
  await expect(page).toHaveURL('/login')
})

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

test('login page renders email, password fields and Sign in button', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/password/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('login page has no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto('/login')
  expect(errors).toHaveLength(0)
})

test('/login?registered=1 shows green Account created banner', async ({ page }) => {
  await page.goto('/login?registered=1')
  const banner = page.getByText(/account created/i)
  await expect(banner).toBeVisible()
  // Banner should carry a success/green colour class
  await expect(banner).toHaveClass(/success|green/i)
})

test('login submit with backend down stays on /login without crash', async ({ page }) => {
  // Block all API requests so the backend appears unreachable
  await page.route('**/api/v1/auth/login', (route) => route.abort('failed'))

  await page.goto('/login')
  await page.getByLabel(/email/i).fill('test@example.com')
  await page.getByLabel(/password/i).fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()

  // Should stay on /login — not crash or redirect
  await expect(page).toHaveURL('/login')
  // Error message should appear somewhere on the page
  await expect(page.getByText(/failed|error|try again/i)).toBeVisible()
})

test('empty login submit triggers browser validation, no crash', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /sign in/i }).click()
  // Page should remain on /login
  await expect(page).toHaveURL('/login')
})

// ---------------------------------------------------------------------------
// Signup page
// ---------------------------------------------------------------------------

test('signup page renders form fields', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/password/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible()
})

test('signup page has no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto('/signup')
  expect(errors).toHaveLength(0)
})

test('signup submit with backend down stays on /signup without crash', async ({ page }) => {
  await page.route('**/api/v1/auth/signup', (route) => route.abort('failed'))

  await page.goto('/signup')
  await page.getByLabel(/email/i).fill('new@example.com')
  await page.getByLabel(/password/i).fill('password123')
  await page.getByRole('button', { name: /sign up|create account/i }).click()

  await expect(page).toHaveURL('/signup')
  await expect(page.getByText(/failed|error|try again/i)).toBeVisible()
})

test('login page has a link to /signup', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: /sign up|create account/i }).click()
  await expect(page).toHaveURL('/signup')
})

// ---------------------------------------------------------------------------
// Auth guard — garbage token
// ---------------------------------------------------------------------------

test('garbage token causes /me 401 → token cleared → redirect to /login', async ({ page }) => {
  // Mock the /me endpoint to return 401
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) })
  )

  // Plant a garbage token directly in localStorage before navigating
  await page.goto('/login')
  await page.evaluate((key) => localStorage.setItem(key, 'garbage-token'), TOKEN_KEY)

  await page.goto('/tracks')

  // Should be redirected to /login and token should be cleared
  await expect(page).toHaveURL('/login')
  const token = await page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY)
  expect(token).toBeNull()
})
