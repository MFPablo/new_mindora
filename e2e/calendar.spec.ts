import { test, expect } from "@playwright/test";

const PATIENT_EMAIL = "patient@mindora.com";
const PASSWORD = "password123";

test.describe("Patient Sessions Calendar Functional Test", () => {
  test.beforeEach(async ({ page }) => {
    // page.on('console', msg => console.log('BROWSER:', msg.text()));
    await page.context().clearCookies();
    // Login
    await page.goto("/login");
    await page.locator("#email").fill(PATIENT_EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();

    await page.waitForURL("**/profile", { timeout: 15000 });
    await page.goto("/dashboard/patient");
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Navigate to sessions view
    await page.getByRole("link", { name: "Mis Sesiones" }).click();
    await expect(page.getByRole("heading", { name: "Mi Calendario" })).toBeVisible();

    // Wait for the appointments to be loaded in the calendar
    await page.waitForResponse(resp => resp.url().includes("/api/patient/appointments") && resp.status() === 200);
  });

  test("should display the calendar and switch months", async ({ page }) => {
    const currentMonthText = await page.locator("span.capitalize").innerText();

    // Click next month
    await page.locator("button").filter({ has: page.locator("svg") }).nth(1).click();
    const nextMonthText = await page.locator("span.capitalize").innerText();
    expect(nextMonthText).not.toBe(currentMonthText);

    // Click prev month
    await page.locator("button").filter({ has: page.locator("svg") }).nth(0).click();
    const backToCurrentText = await page.locator("span.capitalize").innerText();
    expect(backToCurrentText).toBe(currentMonthText);
  });

  test("should show virtual session details and join button", async ({ page }) => {
    // Wait for appointments to be visible on the calendar grid
    const calendarAppointment = page.getByText("14:00 - Dr. Mindora Pro");
    await expect(calendarAppointment).toBeVisible({ timeout: 15000 });

    // Click on the day cell that contains day 24
    const day24 = page.locator('div.cursor-pointer').filter({ has: page.locator('span', { hasText: /^24$/ }) });
    await day24.click();

    // Check professional info in sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText("Dr. Mindora Pro").first()).toBeVisible();
    await expect(sidebar.getByText("Videollamada").first()).toBeVisible();

    // Check "Unirse" button (only for virtual)
    await expect(sidebar.getByRole("button", { name: "Unirse" })).toBeVisible();
  });

  test("should show face-to-face session details without join button", async ({ page }) => {
    const calendarAppointment = page.getByText("10:00 - Dr. Mindora Pro");
    await expect(calendarAppointment).toBeVisible({ timeout: 15000 });

    const day25 = page.locator('div.cursor-pointer').filter({ has: page.locator('span', { hasText: /^25$/ }) });
    await day25.click();

    const sidebar = page.locator('aside');
    await expect(sidebar.getByText("Dr. Mindora Pro").first()).toBeVisible();
    await expect(sidebar.getByText("Presencial").first()).toBeVisible();

    // Check "Unirse" button should NOT be visible
    await expect(sidebar.getByRole("button", { name: "Unirse" })).not.toBeVisible();
  });

  test("should validate reschedule button based on anticipation hours", async ({ page }) => {
    const calendarAppointment = page.getByText("16:30 - Dr. Mindora Pro");
    await expect(calendarAppointment).toBeVisible({ timeout: 15000 });

    const day26 = page.locator('div.cursor-pointer').filter({ has: page.locator('span', { hasText: /^26$/ }) });
    await day26.click();

    const sidebar = page.locator('aside');
    const rescheduleButton = sidebar.getByRole("button", { name: "Reprogramar" });
    await expect(rescheduleButton).toBeVisible();
    await expect(rescheduleButton).toBeEnabled();
  });
});
