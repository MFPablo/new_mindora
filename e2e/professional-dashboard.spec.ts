import { test, expect } from "@playwright/test";

const PROF_EMAIL = "professional@mindora.com";
const PASSWORD = "password123";

test.describe("Professional Dashboard Functional Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    // Login as professional
    await page.goto("/login");
    await page.locator("#email").fill(PROF_EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    
    // The app redirects to /profile after login
    await page.waitForURL("**/profile", { timeout: 15000 });
    
    // Now go to dashboard
    await page.goto("/dashboard/professional");
    await page.waitForURL("**/dashboard/professional", { timeout: 15000 });
    await page.waitForLoadState("networkidle");
  });

  test("should display correct dashboard header and stats", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: /Buenos días/i })).toBeVisible();

    // Check Stats Cards
    await expect(main.getByText("Pacientes Totales")).toBeVisible();
    await expect(main.getByText("Completado")).toBeVisible();
    await expect(main.getByText("Informes Pendientes")).toBeVisible();
    await expect(main.getByText("Satisfacción")).toBeVisible();
  });

  test("should toggle professional profile visibility", async ({ page }) => {
    // Look for the "Estado del Perfil" card
    const privacyCard = page.locator("div").filter({ hasText: "Estado del Perfil" });
    const toggleButton = privacyCard.locator("button").last();
    
    // Check initial text
    const visibilityText = privacyCard.locator("p.text-xs"); // The description below the title
    await expect(visibilityText).toBeVisible();
    const initialState = await visibilityText.innerText();
    
    // Click toggle
    await toggleButton.click();
    await page.waitForTimeout(2000); // Wait for API
    
    // Verify text changed
    const newState = await visibilityText.innerText();
    expect(newState).not.toBe(initialState);
    
    // Toggle back
    await toggleButton.click();
    await page.waitForTimeout(2000);
    await expect(visibilityText).toHaveText(initialState);
  });

  test("should navigate to public profile via quick action", async ({ page }) => {
    const quickActions = page.locator("section").filter({ hasText: "Acciones Rápidas" });
    const viewProfileLink = quickActions.getByText("Ver mi perfil público");
    
    await expect(viewProfileLink).toBeVisible();
    
    // Handle the new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      viewProfileLink.click(),
    ]);
    
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/\/professional\//);
    await expect(newPage.getByText("Dr. Mindora Pro")).toBeVisible();
    await newPage.close();
  });
});
