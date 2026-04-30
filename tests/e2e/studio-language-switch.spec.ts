import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 90000 });

test.describe("Studio language switch", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("defaults to Chinese and persists English after switching", async ({
    page,
  }) => {
    await page.goto("/?seed=test-studio-language&width=1280&height=720");
    await page.waitForFunction(() => (window as any).mapId !== undefined, {
      timeout: 60000,
    });
    await page
      .locator("#studioApp")
      .waitFor({ state: "visible", timeout: 10000 });

    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.locator(".studio-topbar")).not.toContainText(
      "预览版 Beta",
    );
    await expect(page.locator(".studio-topbar")).not.toContainText(
      "用结构化生成打造可玩的世界。",
    );
    await expect(
      page.locator("[data-studio-action='section'][data-value='project']"),
    ).toContainText("项目中心");
    await expect(
      page.locator("[data-studio-action='section'][data-value='canvas']"),
    ).toContainText("画布");
    await expect(page.locator(".studio-topbar")).toContainText("游戏类型");

    await expect(
      page.locator("[data-studio-action='language-toggle'][data-value='en']"),
    ).toBeVisible();
    await page
      .locator("[data-studio-action='language-toggle'][data-value='en']")
      .click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".studio-topbar")).not.toContainText(
      "Preview Beta",
    );
    await expect(page.locator(".studio-topbar")).not.toContainText(
      "Build playable worlds from structured generation.",
    );
    await expect(
      page.locator("[data-studio-action='section'][data-value='project']"),
    ).toContainText("Projects");
    await expect(
      page.locator("[data-studio-action='section'][data-value='canvas']"),
    ).toContainText("Canvas");
    await expect(page.locator(".studio-topbar")).toContainText("Game type");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("agm-studio-language")))
      .toBe("en");

    await page.reload();
    await page.waitForFunction(() => (window as any).mapId !== undefined, {
      timeout: 60000,
    });
    await page
      .locator("#studioApp")
      .waitFor({ state: "visible", timeout: 10000 });

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.locator("[data-studio-action='section'][data-value='project']"),
    ).toContainText("Projects");
  });
});
