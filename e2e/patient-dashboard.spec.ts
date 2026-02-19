import { test, expect } from "@playwright/test";

const PATIENT_EMAIL = "patient@mindora.com";
const PASSWORD = "password123";

test.describe("Patient Dashboard Functional Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    // Login before each test
    await page.goto("/login");
    await page.locator("#email").fill(PATIENT_EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    
    // The app redirects to /profile after login
    await page.waitForURL("**/profile", { timeout: 15000 });
    
    // Now go to dashboard
    await page.goto("/dashboard/patient");
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
  });

  test("should display correct dashboard sections and stats", async ({ page }) => {
    const main = page.getByRole("main");
    // Check Header
    await expect(main.locator("h1")).toContainText(/Hola,/i);

    // Check Stats - scope to main to avoid sidebar links
    await expect(main.getByText("Próxima Sesión")).toBeVisible();
    await expect(main.getByText("Mi Equipo")).toBeVisible();
    await expect(main.getByText("Recursos", { exact: true })).toBeVisible();

    // Check Sections - use headings
    await expect(main.getByRole("heading", { name: "Próximas Sesiones" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Mis Profesionales" })).toBeVisible();
    await expect(main.getByRole("heading", { name: /Recursos Útiles/i })).toBeVisible();
  });

  test("should allow opening and closing the Crisis SOS modal", async ({ page }) => {
    // The SOS button is a floating action button with text "sos"
    const sosButton = page.locator("button").filter({ has: page.locator("span", { hasText: "sos" }) });
    await expect(sosButton).toBeVisible();
    
    // Open modal
    await sosButton.click();
    
    // Verify modal content
    const modal = page.locator("div").filter({ hasText: "¿Necesitas ayuda urgente?" }).last();
    await expect(modal).toBeVisible();
    await expect(page.getByText("Si estás en una situación de crisis")).toBeVisible();
    
    // Close modal
    await modal.getByRole("button", { name: "Cerrar" }).click();
    await expect(modal).not.toBeVisible();
  });

  test("should navigate to professional profile from 'Mis Profesionales' section", async ({ page }) => {
    const main = page.getByRole("main");
    const professionalSection = main.locator("section").filter({ hasText: "Mis Profesionales" });
    const proCard = professionalSection.locator("div").filter({ hasText: "Dr. Mindora Pro" }).first();
    const profileLink = proCard.getByRole("link", { name: "Perfil" });
    
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    
    // Should navigate to public profile
    await page.waitForURL("**/professional/*", { timeout: 10000 });
    await expect(page).toHaveURL(/\/professional\//);
    await expect(page.getByText("Dr. Mindora Pro")).toBeVisible();
  });
});
