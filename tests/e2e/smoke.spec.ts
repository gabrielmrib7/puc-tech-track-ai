import { test, expect } from "@playwright/test";

test.describe("TechTrack — Smoke Test", () => {
  test("loads the home page with title, Logo, and Technical Precision styling", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");

    // Verify page title
    await expect(page).toHaveTitle(/TechTrack/);

    // Verify Logo element
    const logoImg = page.locator("img[alt='TechTrack']");
    await expect(logoImg).toBeVisible();

    // Verify main heading and Technical Precision System badge
    await expect(page.locator("h1")).toContainText("Ordens de Serviço");
    await expect(page.getByText("Technical Precision System")).toBeVisible();

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });
});

