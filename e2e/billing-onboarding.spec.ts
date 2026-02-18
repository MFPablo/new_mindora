import { test, expect } from "@playwright/test";

const TEST_EMAIL_BASE = `test_user_`;
const TEST_PASSWORD = "Password123!";

test.describe("Billing and Onboarding Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should validate Step 1 fields in onboarding", async ({ page }) => {
    const email = `${TEST_EMAIL_BASE}${Date.now()}_val@example.com`;
    await page.goto("/signup");
    await page.locator("#name").fill("Test User Validation");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);

    await page.getByText("Profesional", { exact: true }).click();
    await page.locator("#terms").check();
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    await page.waitForURL("**/onboarding/step-1", { timeout: 15000 });
    await page.getByRole("button", { name: "Siguiente Paso" }).click();
    await expect(page).toHaveURL(/\/onboarding\/step-1/);
  });

  test("should complete onboarding with a professional plan", async ({ page }) => {
    const email = `${TEST_EMAIL_BASE}${Date.now()}_onb@example.com`;

    await page.goto("/signup");
    await page.locator("#name").fill("Dr. Test Pro");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByText("Profesional", { exact: true }).click();
    await page.locator("#terms").check();
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    await page.waitForURL("**/onboarding/step-1", { timeout: 15000 });

    await page.locator("#phone").fill("+34600000000");
    await page.locator("#address").fill("Calle de Prueba 456, Madrid");
    await page.getByRole("button", { name: "Siguiente Paso" }).click();

    await page.waitForURL("**/onboarding/step-2");
    await page.getByRole("button", { name: "Guardar y Continuar" }).click();

    await page.waitForURL("**/onboarding/step-3");
    await page.getByRole("button", { name: "Activar Suscripción Pro" }).click();

    await page.waitForURL("**/dashboard/professional", { timeout: 20000 });

    await page.goto("/profile");
    await page.locator("button:has-text('Pagos y Facturación')").click();
    await expect(page.getByText("Suscripción Profesional Activa")).toBeVisible();

    await expect(page.getByText("Plan Premium Anual")).toBeVisible();
    await expect(page.getByText("$290.00")).toBeVisible();
  });

  test("should fail promo code redemption with invalid key", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("patient@mindora.com");
    await page.locator("#password").fill("password123");
    await page.locator("form").getByRole("button", { name: "Iniciar sesión", exact: true }).click();

    await page.waitForURL("**/profile");
    await page.locator("button:has-text('Códigos Promocionales')").click();

    await page.locator("input[placeholder='EJ: MINDORA2024']").fill("INVALID_CODE_999");
    await page.getByRole("button", { name: "Canjear Código" }).click();

    await expect(page.getByText("Código no válido")).toBeVisible();
  });

  test("should successfully redeem a valid promo code", async ({ page }) => {
    // Signup a fresh patient to ensure code is not yet redeemed
    const email = `${TEST_EMAIL_BASE}${Date.now()}_promo@example.com`;
    await page.goto("/signup");
    await page.locator("#name").fill("Patient Fresh");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByText("Paciente", { exact: true }).click();
    await page.locator("#terms").check();
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    await page.waitForURL("**/profile");

    await page.locator("button:has-text('Pagos y Facturación')").click();
    const initialRows = await page.locator("tbody tr").count();

    await page.locator("button:has-text('Códigos Promocionales')").click();
    await page.locator("input[placeholder='EJ: MINDORA2024']").fill("MINDORA20");
    await page.getByRole("button", { name: "Canjear Código" }).click();

    // The message includes "Canjeado con éxito" but also includes an icon name (check_circle)
    await expect(page.locator("div").filter({ hasText: /Canjeado con éxito/i })).toBeVisible();

    await page.locator("button:has-text('Pagos y Facturación')").click();
    await expect(page.getByText("Código: MINDORA20")).toBeVisible();
    await expect(page.getByText("GRATIS")).toBeVisible();

    const finalRows = await page.locator("tbody tr").count();
    expect(finalRows).toBeGreaterThan(initialRows);
  });

  test("should show detailed history for professional user from seed", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("professional@mindora.com");
    await page.locator("#password").fill("password123");
    await page.locator("form").getByRole("button", { name: "Iniciar sesión", exact: true }).click();

    await page.waitForURL("**/profile");

    await expect(page.getByRole("button", { name: "Hacerse Profesional" })).not.toBeVisible();

    await page.locator("button:has-text('Pagos y Facturación')").click();
    await expect(page.getByText("Plan Premium Anual")).toBeVisible();
    await expect(page.getByText("$290.00")).toBeVisible();
    await expect(page.getByText("Código: TEST_REDEEMED")).toBeVisible();
    await expect(page.getByText("CANJEADO")).toBeVisible();
  });
});
