import { test, expect } from "@playwright/test";

const PATIENT_EMAIL = "patient@mindora.com";
const PASSWORD = "password123";

test.describe("Booking Flow Functional Test", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should allow a patient to book an appointment with a professional", async ({ page }) => {
    // 1. Login as patient
    await page.goto("/login");
    await page.locator("#email").fill(PATIENT_EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();

    await page.waitForURL("**/profile", { timeout: 15000 });
    
    // Now go to dashboard to find a professional
    await page.goto("/dashboard/patient");
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // 2. Click on a professional card
    const main = page.getByRole("main");
    const proSection = main.locator("section").filter({ hasText: "Mis Profesionales" });
    const proCard = proSection.locator("div").filter({ hasText: "Dr. Mindora Pro" }).first();
    const profileLink = proCard.getByRole("link", { name: "Perfil" });
    
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    
    await page.waitForURL("**/professional/*", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Dr. Mindora Pro" })).toBeVisible();

    // 3. Interact with the Calendar
    // The calendar section starts with "Seleccionar horario"
    await page.getByRole("heading", { name: "Seleccionar horario" }).scrollIntoViewIfNeeded();

    // Wait for slots to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Try to find an available slot. Slots are buttons with time format or "Ocupado"
    // We want a button that is NOT disabled and does NOT have "Ocupado" text
    const availableSlots = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ });
    
    // If no slots available this week, go to next week
    if (await availableSlots.count() === 0) {
      await page.locator("button").filter({ has: page.locator("span", { hasText: "chevron_right" }) }).click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState("networkidle");
    }

    const firstSlot = availableSlots.first();
    await expect(firstSlot).toBeVisible();
    
    const slotTime = await firstSlot.innerText();
    await firstSlot.click();

    // Click "Agendar" button to open modal
    await page.getByRole("button", { name: "Agendar" }).click();

    // 4. Booking Confirmation Modal
    const modal = page.locator("div").filter({ hasText: "Confirmar Reserva" }).last();
    await expect(modal).toBeVisible();
    await expect(modal.getByText(slotTime, { exact: false })).toBeVisible();

    // Success Feedback - the app shows an alert with "¡Turno reservado con éxito!"
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("éxito");
      await dialog.accept();
    });

    // Finalize booking
    await modal.getByRole("button", { name: "Confirmar Reserva" }).click();

    // After success, modal closes. We should verify we can see the appointment in dashboard later or just trust the alert for now.
    // Let's manually go back to dashboard to verify
    await page.goto("/dashboard/patient");
    await page.waitForURL("**/dashboard/patient", { timeout: 15000 });
    await expect(page.getByText("Próximas Sesiones", { exact: true })).toBeVisible();
  });
});
