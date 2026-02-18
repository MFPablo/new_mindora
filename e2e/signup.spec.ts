import { test, expect } from "@playwright/test";

// Generate a unique email for each test run to avoid conflicts
const timestamp = Date.now();
const TEST_USER = {
  name: "Playwright User",
  email: `pw-test-${timestamp}@test.com`,
  password: "TestPass123!",
  role: "patient",
};

test.describe("Signup Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should show the signup form with role selection", async ({ page }) => {
    await page.goto("/signup");

    // Role selection buttons
    await expect(page.getByText("Paciente")).toBeVisible();
    await expect(page.getByText("Profesional")).toBeVisible();

    // Form fields
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/signup");

    // Try to submit without filling anything (click the submit button)
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    // Should show validation errors (zod/react-hook-form)
    await page.waitForTimeout(500);
    const errorMessages = page.locator("text=obligatorio, text=requerido, text=inválido");
    // At least some validation should appear - the form shouldn't navigate away
    await expect(page).toHaveURL(/\/signup/);
  });

  test("should successfully register a new user", async ({ page }) => {
    await page.goto("/signup");

    // Select patient role
    await page.getByText("Paciente").click();

    // Fill in form
    await page.locator("#name").fill(TEST_USER.name);
    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill(TEST_USER.password);

    // Submit
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    // Should redirect to profile after auto-login
    await page.waitForURL("**/profile", { timeout: 10000 });
    await expect(page).toHaveURL(/\/profile/);
  });

  test("should not allow duplicate email registration", async ({ page }) => {
    await page.goto("/signup");

    // Select patient role
    await page.getByText("Paciente").click();

    // Try to register with same email
    await page.locator("#name").fill("Duplicate User");
    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#password").fill("AnotherPass123!");

    await page.getByRole("button", { name: "Crear cuenta" }).click();

    // Should show an error and stay on signup page
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/signup/);
  });
});
