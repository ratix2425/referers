import { test, expect } from '@playwright/test'

test.describe('Registro de usuarios', () => {
  test('10.1 - flujo completo de registro con código válido', async ({ page }) => {
    // Este test requiere un usuario root con código conocido en la DB
    // En CI se puede inyectar via env var ROOT_REFERRAL_CODE
    const rootCode = process.env.ROOT_REFERRAL_CODE ?? 'TESTCODE01'
    const email = `test-${Date.now()}@e2e-test.com`

    await page.goto(`/register?ref=${rootCode}`)

    // El código debe estar pre-cargado en el formulario
    await expect(page.getByPlaceholder(/código de referido/i)).toHaveValue(rootCode)

    await page.fill('[placeholder="tu@email.com"]', email)
    await page.fill('[placeholder="Mínimo 8 caracteres"]', 'Password123')
    await page.click('button[type="submit"]')

    // Después del registro exitoso, debe redirigir al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('10.2 - registro sin código de referido muestra error', async ({ page }) => {
    await page.goto('/register')

    await page.fill('[placeholder="tu@email.com"]', 'test@e2e-test.com')
    await page.fill('[placeholder="Mínimo 8 caracteres"]', 'Password123')

    // Limpiar el campo de código si tiene valor por defecto
    await page.fill('[placeholder*="Ej:"]', '')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/código de referido es obligatorio/i)).toBeVisible()
  })

  test('10.3 - registro con código inválido muestra error', async ({ page }) => {
    await page.goto('/register?ref=INVALIDCODE')

    await page.fill('[placeholder="tu@email.com"]', `invalid-${Date.now()}@e2e-test.com`)
    await page.fill('[placeholder="Mínimo 8 caracteres"]', 'Password123')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/código de referido inválido/i)).toBeVisible()
  })
})
