import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ timeout: 120000 });

async function resetIndexedDbSnapshot(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("d2");
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!Array.from(db.objectStoreNames).includes("s")) {
          db.createObjectStore("s", { keyPath: "key" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("s", "readwrite");
        const store = transaction.objectStore("s");
        store.put({ key: "lastMap", value: null });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
}

async function enterNativeWorkbench(page: Page) {
  const enterWorkbench = page.locator(
    ".studio-project-home__action[data-studio-action='direct-workbench-jump'][data-value='states']",
  );
  await expect(enterWorkbench).toBeVisible();
  await enterWorkbench.click();
  await page
    .locator("#studioCanvasFrame")
    .waitFor({ state: "visible", timeout: 10000 });
}

async function openNativeModule(page: Page, key: string, targetId: string) {
  const navKeyByModule: Record<string, string> = {
    burgs: "states",
    cultures: "states",
    diplomacy: "states",
    markers: "mapFeatures",
    provinces: "states",
    religions: "states",
    routes: "mapFeatures",
    zones: "mapFeatures",
  };
  const navKey = navKeyByModule[key] ?? key;
  const moduleButton = page.locator(
    `.studio-native-iconbar [data-studio-action='direct-workbench-jump'][data-value='${navKey}']`,
  );
  await expect(moduleButton).toBeVisible();
  await moduleButton.click();

  const drawer = page.locator("[data-native-v8-info-panel='true']");
  if (navKey !== key) {
    await drawer
      .locator(`[data-studio-action='direct-workbench-jump'][data-value='${key}']`)
      .click();
  }
  await expect(moduleButton).toHaveClass(/is-active/);
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(`#${targetId}`)).toBeVisible();
  return drawer.locator(`#${targetId}`);
}

async function getVisibleLegacyDialogCount(page: Page) {
  return page.locator("#dialogs > *").evaluateAll((dialogs) =>
    dialogs.filter((dialog) => {
      const element = dialog as HTMLElement;
      if (
        element.dataset.agmEngineDialog !== undefined ||
        element.dataset.studioEngineDialog !== undefined
      ) {
        return false;
      }
      if (element.hidden || element.offsetParent === null) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length,
  );
}

test.describe("AGM V1 native editor convergence", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("agm-studio-language", "en");
    });
    await resetIndexedDbSnapshot(page);

    await page.goto("/?seed=test-studio-v1-editors&width=1280&height=720");
    await page.waitForFunction(() => (window as any).mapId !== undefined, {
      timeout: 60000,
    });
    await page
      .locator("#studioApp")
      .waitFor({ state: "visible", timeout: 10000 });
    await page.waitForFunction(
      () => {
        const loading = document.getElementById("loading") as HTMLElement | null;
        const loadingHidden =
          !loading ||
          Number.parseFloat(window.getComputedStyle(loading).opacity || "1") <
            0.1;
        return loadingHidden && (window as any).mapId !== undefined;
      },
      { timeout: 15000 },
    );
    await page.waitForTimeout(500);
    await enterNativeWorkbench(page);
  });

  test("applies writebacks from high-frequency native editor drawers", async ({
    page,
  }) => {
    let workbench = await openNativeModule(
      page,
      "states",
      "studioDirectStatesWorkbench",
    );
    await expect(
      workbench.locator(".studio-native-state-detail__actions"),
    ).toBeVisible();
    const stateButton = workbench
      .locator("[data-studio-action='direct-state-select']")
      .nth(1);
    const stateId = Number(await stateButton.getAttribute("data-state-id"));
    expect(stateId).toBeGreaterThan(0);
    await stateButton.click();

    const nextStateName = `V1 State ${stateId}`;
    const nextStateFullName = `${nextStateName} Dominion`;
    await page.locator("#studioStateNameInput").fill(nextStateName);
    await page.locator("#studioStateFullNameInput").fill(nextStateFullName);
    await page.locator("#studioStateFormNameInput").fill("Dominion");
    await page.locator("#studioStateColorInput").fill("#3366aa");
    await page.locator("#studioStatePopulationInput").fill("234567");
    await expect(page.locator("#studioStateEditStatus")).toHaveAttribute(
      "data-status",
      "dirty",
    );
    await workbench.locator("[data-studio-action='direct-state-apply']").click();
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const state = pack.states[id];
          return {
            color: state.color,
            formName: state.formName,
            fullName: state.fullName,
            name: state.name,
            population: state.population,
          };
        }, stateId),
      )
      .toEqual({
        color: "#3366aa",
        formName: "Dominion",
        fullName: nextStateFullName,
        name: nextStateName,
        population: 234567,
      });
    await expect(page.locator("#studioStateEditStatus")).toHaveAttribute(
      "data-status",
      "saved",
    );
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);

    workbench = await openNativeModule(
      page,
      "cultures",
      "studioDirectCulturesWorkbench",
    );
    await expect(
      workbench.locator(".studio-native-identity-detail__actions"),
    ).toBeVisible();
    const cultureButton = workbench
      .locator("[data-studio-action='direct-culture-select']")
      .first();
    const cultureId = Number(await cultureButton.getAttribute("data-culture-id"));
    expect(cultureId).toBeGreaterThan(0);
    await cultureButton.click();

    const nextCultureName = `V1 Culture ${cultureId}`;
    await page.locator("#studioCultureNameInput").fill(nextCultureName);
    await page.locator("#studioCultureTypeInput").fill("Clade");
    await page.locator("#studioCultureColorInput").fill("#aa8844");
    await expect(page.locator("#studioCultureEditStatus")).toHaveAttribute(
      "data-status",
      "dirty",
    );
    await workbench
      .locator("[data-studio-action='direct-culture-apply']")
      .click();
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const culture = pack.cultures[id];
          return {
            color: culture.color,
            form: culture.form,
            formName: culture.formName,
            name: culture.name,
            type: culture.type,
          };
        }, cultureId),
      )
      .toEqual({
        color: "#aa8844",
        form: "Clade",
        formName: "Clade",
        name: nextCultureName,
        type: "Clade",
      });
    await expect(page.locator("#studioCultureEditStatus")).toHaveAttribute(
      "data-status",
      "saved",
    );
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);

    workbench = await openNativeModule(
      page,
      "religions",
      "studioDirectReligionsWorkbench",
    );
    await expect(
      workbench.locator(".studio-native-identity-detail__actions"),
    ).toBeVisible();
    const religionButton = workbench
      .locator("[data-studio-action='direct-religion-select']")
      .first();
    const religionId = Number(
      await religionButton.getAttribute("data-religion-id"),
    );
    expect(religionId).toBeGreaterThan(0);
    await religionButton.click();

    const nextReligionName = `V1 Religion ${religionId}`;
    await page.locator("#studioReligionNameInput").fill(nextReligionName);
    await page.locator("#studioReligionTypeInput").fill("Order");
    await page.locator("#studioReligionColorInput").fill("#8866cc");
    await expect(page.locator("#studioReligionEditStatus")).toHaveAttribute(
      "data-status",
      "dirty",
    );
    await workbench
      .locator("[data-studio-action='direct-religion-apply']")
      .click();
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const religion = pack.religions[id];
          return {
            color: religion.color,
            form: religion.form,
            formName: religion.formName,
            name: religion.name,
            type: religion.type,
          };
        }, religionId),
      )
      .toEqual({
        color: "#8866cc",
        form: "Order",
        formName: "Order",
        name: nextReligionName,
        type: "Order",
      });
    await expect(page.locator("#studioReligionEditStatus")).toHaveAttribute(
      "data-status",
      "saved",
    );
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);

    workbench = await openNativeModule(
      page,
      "provinces",
      "studioDirectProvincesWorkbench",
    );
    await expect(
      workbench.locator(".studio-native-identity-detail__actions"),
    ).toBeVisible();
    const provinceButton = workbench
      .locator("[data-studio-action='direct-province-select']")
      .first();
    const provinceId = Number(
      await provinceButton.getAttribute("data-province-id"),
    );
    expect(provinceId).toBeGreaterThan(0);
    await provinceButton.click();

    const nextProvinceName = `V1 Province ${provinceId}`;
    const nextProvinceFullName = `${nextProvinceName} Full`;
    await page.locator("#studioProvinceNameInput").fill(nextProvinceName);
    await page.locator("#studioProvinceFullNameInput").fill(nextProvinceFullName);
    await page.locator("#studioProvinceTypeInput").fill("March");
    await page.locator("#studioProvinceColorInput").fill("#336699");
    await expect(page.locator("#studioProvinceEditStatus")).toHaveAttribute(
      "data-status",
      "dirty",
    );
    await workbench
      .locator("[data-studio-action='direct-province-apply']")
      .click();
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const province = pack.provinces[id];
          return {
            color: province.color,
            formName: province.formName,
            fullName: province.fullName,
            name: province.name,
            type: province.type,
          };
        }, provinceId),
      )
      .toEqual({
        color: "#336699",
        formName: "March",
        fullName: nextProvinceFullName,
        name: nextProvinceName,
        type: "March",
      });
    await expect(page.locator("#studioProvinceEditStatus")).toHaveAttribute(
      "data-status",
      "saved",
    );
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);

    workbench = await openNativeModule(
      page,
      "burgs",
      "studioDirectBurgsWorkbench",
    );
    await expect(
      workbench.locator(".studio-native-identity-detail__actions"),
    ).toBeVisible();
    const burgButton = workbench
      .locator("[data-studio-action='direct-burg-select']")
      .first();
    const burgId = Number(await burgButton.getAttribute("data-burg-id"));
    expect(burgId).toBeGreaterThan(0);
    await burgButton.click();

    const nextBurgName = `V1 Burg ${burgId}`;
    await page.locator("#studioBurgNameInput").fill(nextBurgName);
    await page.locator("#studioBurgTypeInput").fill("Harbor");
    await page.locator("#studioBurgPopulationInput").fill("34567");
    await expect(page.locator("#studioBurgEditStatus")).toHaveAttribute(
      "data-status",
      "dirty",
    );
    await workbench.locator("[data-studio-action='direct-burg-apply']").click();
    await expect
      .poll(() =>
        page.evaluate((id) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const burg = pack.burgs[id];
          return {
            name: burg.name,
            population: burg.population,
            type: burg.type,
          };
        }, burgId),
      )
      .toEqual({ name: nextBurgName, population: 34567, type: "Harbor" });
    await expect(page.locator("#studioBurgEditStatus")).toHaveAttribute(
      "data-status",
      "saved",
    );
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);
  });
});
