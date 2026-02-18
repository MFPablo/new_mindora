import { test, expect } from "@playwright/test";

// Known test user — must exist in the database
const LOGIN_EMAIL = "newtest123@test.com";
const LOGIN_PASSWORD = "Password123!";

test.describe("Profile — Personal Information", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.context().clearCookies();
    await page.goto("/login");
    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/profile", { timeout: 10000 });
  });

  test("should display the profile page with sidebar and form", async ({ page }) => {
    // Sidebar nav
    await expect(page.getByText("Información Personal")).toBeVisible();
    await expect(page.getByText("Seguridad")).toBeVisible();
    await expect(page.getByText("Notificaciones")).toBeVisible();
    await expect(page.getByText("Pagos y Facturación")).toBeVisible();

    // Personal info form
    await expect(page.locator("#nombre")).toBeVisible();
    await expect(page.locator("#apellido")).toBeVisible();
    await expect(page.locator("#profile-email")).toBeVisible();
    await expect(page.locator("#telefono")).toBeVisible();

    // Avatar section
    await expect(page.getByText("Tu Foto de Perfil")).toBeVisible();
    await expect(page.getByText("Subir nueva")).toBeVisible();
  });

  test("should show correct user data in form fields", async ({ page }) => {
    // Check pre-filled data
    await expect(page.locator("#profile-email")).toHaveValue(LOGIN_EMAIL);
    // User name was "Test User" — split into first/last
    await expect(page.locator("#nombre")).toHaveValue("Test");
    await expect(page.locator("#apellido")).toHaveValue("User");
  });

  test("should update name successfully", async ({ page }) => {
    // Change the first name
    await page.locator("#nombre").clear();
    await page.locator("#nombre").fill("TestUpdated");

    // Save
    await page.getByRole("button", { name: "Guardar Cambios" }).click();

    // Wait for save confirmation
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });

    // Reload and verify the change persisted
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("#nombre")).toHaveValue("TestUpdated");

    // Revert the name back for other tests
    await page.locator("#nombre").clear();
    await page.locator("#nombre").fill("Test");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });
  });

  test("should update last name successfully", async ({ page }) => {
    await page.locator("#apellido").clear();
    await page.locator("#apellido").fill("UserUpdated");

    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("#apellido")).toHaveValue("UserUpdated");

    // Revert
    await page.locator("#apellido").clear();
    await page.locator("#apellido").fill("User");
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });
  });

  test("should update phone number successfully", async ({ page }) => {
    await page.locator("#telefono").clear();
    await page.locator("#telefono").fill("+54 11 9999 8888");

    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("#telefono")).toHaveValue("+54 11 9999 8888");

    // Clean up
    await page.locator("#telefono").clear();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });
  });

  test("should update all personal info fields at once", async ({ page }) => {
    await page.locator("#nombre").clear();
    await page.locator("#nombre").fill("NuevoNombre");
    await page.locator("#apellido").clear();
    await page.locator("#apellido").fill("NuevoApellido");
    await page.locator("#telefono").clear();
    await page.locator("#telefono").fill("+54 11 1111 2222");

    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });

    // Verify persistence
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("#nombre")).toHaveValue("NuevoNombre");
    await expect(page.locator("#apellido")).toHaveValue("NuevoApellido");
    await expect(page.locator("#telefono")).toHaveValue("+54 11 1111 2222");

    // Revert all
    await page.locator("#nombre").clear();
    await page.locator("#nombre").fill("Test");
    await page.locator("#apellido").clear();
    await page.locator("#apellido").fill("User");
    await page.locator("#telefono").clear();
    await page.getByRole("button", { name: "Guardar Cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Profile — Password Change", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/profile", { timeout: 10000 });
  });

  test("should display the security section", async ({ page }) => {
    // Scroll to security section
    await page.locator("#security").scrollIntoViewIfNeeded();

    await expect(page.getByText("Cambiar Contraseña")).toBeVisible();
    await expect(page.locator("#current-password")).toBeVisible();
    await expect(page.locator("#new-password")).toBeVisible();
    await expect(page.locator("#confirm-password")).toBeVisible();

    await expect(page.getByRole("button", { name: "Actualizar Contraseña" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
  });

  test("should show error for wrong current password", async ({ page }) => {
    await page.locator("#security").scrollIntoViewIfNeeded();

    await page.locator("#current-password").fill("WrongCurrentPass1!");
    await page.locator("#new-password").fill("NewPassword123!");
    await page.locator("#confirm-password").fill("NewPassword123!");

    await page.getByRole("button", { name: "Actualizar Contraseña" }).click();

    await expect(page.getByText("Contraseña actual incorrecta")).toBeVisible({ timeout: 5000 });
  });

  test("should show error when passwords don't match", async ({ page }) => {
    await page.locator("#security").scrollIntoViewIfNeeded();

    await page.locator("#current-password").fill(LOGIN_PASSWORD);
    await page.locator("#new-password").fill("NewPassword123!");
    await page.locator("#confirm-password").fill("DifferentPass999!");

    await page.getByRole("button", { name: "Actualizar Contraseña" }).click();

    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible({ timeout: 5000 });
  });

  test("should change password successfully and login with new password", async ({ page }) => {
    const NEW_PASSWORD = "NewSecurePass123!";

    // Change password
    await page.locator("#security").scrollIntoViewIfNeeded();
    await page.locator("#current-password").fill(LOGIN_PASSWORD);
    await page.locator("#new-password").fill(NEW_PASSWORD);
    await page.locator("#confirm-password").fill(NEW_PASSWORD);

    await page.getByRole("button", { name: "Actualizar Contraseña" }).click();
    await expect(page.getByText("Contraseña actualizada exitosamente")).toBeVisible({ timeout: 5000 });

    // Logout
    await page.context().clearCookies();

    // Login with new password
    await page.goto("/login");
    await page.locator("#email").fill(LOGIN_EMAIL);
    await page.locator("#password").fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.waitForURL("**/profile", { timeout: 10000 });
    await expect(page).toHaveURL(/\/profile/);

    // Revert password back to original
    await page.locator("#security").scrollIntoViewIfNeeded();
    await page.locator("#current-password").fill(NEW_PASSWORD);
    await page.locator("#new-password").fill(LOGIN_PASSWORD);
    await page.locator("#confirm-password").fill(LOGIN_PASSWORD);
    await page.getByRole("button", { name: "Actualizar Contraseña" }).click();
    await expect(page.getByText("Contraseña actualizada exitosamente")).toBeVisible({ timeout: 5000 });
  });

  test("should clear form fields on cancel", async ({ page }) => {
    await page.locator("#security").scrollIntoViewIfNeeded();

    await page.locator("#current-password").fill("something");
    await page.locator("#new-password").fill("something");
    await page.locator("#confirm-password").fill("something");

    await page.getByRole("button", { name: "Cancelar" }).click();

    await expect(page.locator("#current-password")).toHaveValue("");
    await expect(page.locator("#new-password")).toHaveValue("");
    await expect(page.locator("#confirm-password")).toHaveValue("");
  });
});
