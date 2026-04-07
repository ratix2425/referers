import { test, expect } from '@playwright/test'

const ROOT_EMAIL = process.env.ROOT_EMAIL ?? 'root@referidos.local'
const ROOT_PASSWORD = process.env.ROOT_PASSWORD ?? 'root-change-me'

test.describe('Autenticación', () => {
  test('10.4 - login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[placeholder="tu@email.com"]', ROOT_EMAIL)
    await page.fill('[placeholder="Tu contraseña"]', ROOT_PASSWORD)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    await expect(page.getByText(/referidos/i)).toBeVisible()
  })

  test('10.5 - login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[placeholder="tu@email.com"]', 'wrong@example.com')
    await page.fill('[placeholder="Tu contraseña"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('usuario no autenticado es redirigido desde /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })
})
