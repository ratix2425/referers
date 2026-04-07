import { test, expect } from '@playwright/test'

const ROOT_EMAIL = process.env.ROOT_EMAIL ?? 'root@referidos.local'
const ROOT_PASSWORD = process.env.ROOT_PASSWORD ?? 'root-change-me'

async function loginAsRoot(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('[placeholder="tu@email.com"]', ROOT_EMAIL)
  await page.fill('[placeholder="Tu contraseña"]', ROOT_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

test.describe('Dashboard', () => {
  test('10.6 - visualiza árbol con al menos el nodo raíz', async ({ page }) => {
    await loginAsRoot(page)
    await expect(page).toHaveURL('/dashboard')

    // El componente del árbol debe estar presente
    await expect(page.locator('svg')).toBeVisible({ timeout: 5000 })
  })

  test('10.7 - copiar link de referido muestra confirmación', async ({ page, context }) => {
    // Habilitar acceso al portapapeles en el contexto
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await loginAsRoot(page)

    const copyBtn = page.getByRole('button', { name: /copiar/i })
    await expect(copyBtn).toBeVisible()
    await copyBtn.click()

    // El botón debe cambiar su texto a "¡Copiado!"
    await expect(copyBtn).toHaveText('¡Copiado!', { timeout: 2000 })

    // Y volver al texto original después de ~2.5s
    await expect(copyBtn).toHaveText('Copiar', { timeout: 4000 })
  })
})
