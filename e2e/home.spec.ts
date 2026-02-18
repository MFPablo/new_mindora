import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page and display key elements", async ({ page }) => {
    await page.goto("/");

    // Verify the Mindora branding in the navbar
    await expect(page.locator("header")).toContainText("Mindora");

    // Verify navigation links exist
    await expect(page.getByText("Para Terapeutas")).toBeVisible();
    await expect(page.getByText("Para Pacientes")).toBeVisible();
    await expect(page.getByText("Precios")).toBeVisible();
  });

  test("should display the hero section", async ({ page }) => {
    await page.goto("/");

    // The hero should have the main heading
    await expect(page.locator("main")).toContainText("Mindora");
  });

  test("should display feature cards", async ({ page }) => {
    await page.goto("/");

    // Check for the two main role cards
    await expect(page.getByText("Soy Profesional")).toBeVisible();
    await expect(page.getByText("Soy Paciente")).toBeVisible();
  });

  test("should have login and signup buttons when logged out", async ({ page }) => {
    // Clear cookies to ensure logged out state
    await page.context().clearCookies();
    await page.goto("/");

    await expect(page.getByText("Iniciar Sesión")).toBeVisible();
    await expect(page.getByText("Empezar")).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");

    await page.getByText("Iniciar Sesión").click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");

    await page.getByText("Empezar").click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
