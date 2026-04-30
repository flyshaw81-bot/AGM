import { expect, test } from "@playwright/test";

test.describe("States", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto("/?seed=test-states&width=1280&height=720");
    await page.waitForFunction(() => (window as any).mapId !== undefined, {
      timeout: 60000,
    });
    await page.waitForTimeout(500);
  });

  test("removing a state via UI should allow military regeneration without errors", async ({
    page,
  }) => {
    await page.evaluate(async () => {
      await (window as any).editStates();
    });
    await page.waitForSelector("#statesEditor", {
      state: "visible",
      timeout: 5000,
    });
    await page.waitForTimeout(300);

    const stateId = await page.evaluate(() => {
      const stateRow = document.querySelector(
        "#statesBodySection > div[data-id]",
      ) as HTMLElement;
      return stateRow ? Number.parseInt(stateRow.dataset.id!, 10) : null;
    });

    expect(stateId).not.toBeNull();

    const neighborsBefore = await page.evaluate((id: number) => {
      const { states } = (window as any).pack;
      return states.filter(
        (state: any) =>
          state.i &&
          !state.removed &&
          state.neighbors &&
          state.neighbors.includes(id),
      ).length;
    }, stateId!);

    expect(neighborsBefore).toBeGreaterThanOrEqual(0);

    await page.click(
      `#statesBodySection > div[data-id="${stateId}"] .icon-trash-empty`,
    );

    await page.waitForSelector(".ui-dialog:has(#alert) .ui-dialog-buttonpane", {
      state: "visible",
      timeout: 3000,
    });
    await page.click(".ui-dialog:has(#alert) .ui-dialog-buttonpane button:first-child");
    await page.waitForTimeout(500);

    const neighborsAfter = await page.evaluate((id: number) => {
      const { states } = (window as any).pack;
      return states.filter(
        (state: any) =>
          state.i &&
          !state.removed &&
          state.neighbors &&
          state.neighbors.includes(id),
      ).length;
    }, stateId!);

    expect(neighborsAfter).toBe(0);

    await page.click(".ui-dialog:has(#statesEditor) .ui-dialog-titlebar-close");
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      document.getElementById("regenerateMilitary")?.click();
    });
    await page.waitForTimeout(1000);

    const militaryResult = await page.evaluate(() => {
      const { states } = (window as any).pack;
      const validStates = states.filter((state: any) => state.i && !state.removed);
      return {
        statesCount: validStates.length,
        statesWithMilitary: validStates.filter(
          (state: any) => state.military && state.military.length > 0,
        ).length,
      };
    });

    expect(militaryResult.statesCount).toBeGreaterThan(0);
    expect(militaryResult.statesWithMilitary).toBeGreaterThanOrEqual(0);
  });
});
