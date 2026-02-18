import { test, expect } from "@playwright/test";

// This user must exist in the database — created by the signup tests or manually
// We use a known test user for login tests
const LOGIN_EMAIL = "newtest123@test.com";
const LOGIN_PASSWORD = "Password123!";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should show the login form", async ({ page }) => {
    await page.goto("/login");

    // Verify page title
    await expect(page.getByText("Bienvenido de nuevo")).toBeVisible();

    // Form fields
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    // Buttons
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByText("Iniciar sesión con Google")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill("nonexistent@test.com");
    await page.locator("#password").fill("WrongPassword123!");

    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Should show error message and stay on login
    await page.waitForTimeout(3000);
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("should show error for wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill("WrongPassword999!");

    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await page.waitForTimeout(3000);
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
  });

  test("should login successfully and redirect to profile", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(LOGIN_PASSWORD);

    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Should redirect to profile page
    await page.waitForURL("**/profile", { timeout: 10000 });
    await expect(page).toHaveURL(/\/profile/);

    // Profile should show user info
    await expect(page.getByText("Mi Perfil")).toBeVisible();
  });

  test("should show navbar with user info after login", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/profile", { timeout: 10000 });

    // Navigate to home to check navbar
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Navbar should show user name instead of login buttons
    const header = page.locator("header");
    await expect(header.getByText("Test User")).toBeVisible();
    await expect(header.getByText("Paciente")).toBeVisible();
  });

  test("should logout correctly from navbar", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/profile", { timeout: 10000 });

    // Go to home and open dropdown
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Click user avatar area to open dropdown
    await page.locator("header").getByText("Test User").click();
    await page.waitForTimeout(500);

    // Click "Cerrar Sesión"
    await page.getByText("Cerrar Sesión").click();

    // Should redirect to home and show login buttons
    await page.waitForURL("/", { timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.getByText("Iniciar Sesión")).toBeVisible();
  });

  test("should have a link to signup page", async ({ page }) => {
    await page.goto("/login");

    const signupLink = page.getByText("Crear cuenta");
    await expect(signupLink).toBeVisible();
  });
});
