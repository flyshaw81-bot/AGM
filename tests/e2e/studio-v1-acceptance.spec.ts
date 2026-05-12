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
  const homeEnterWorkbench = page.locator(
    ".studio-project-home__action[data-studio-action='direct-workbench-jump'][data-value='states']",
  );
  if (await homeEnterWorkbench.count()) {
    await homeEnterWorkbench.click();
  } else {
    await page
      .locator("[data-studio-action='section'][data-value='canvas']")
      .first()
      .click();
  }

  await page
    .locator("#studioCanvasFrame")
    .waitFor({ state: "visible", timeout: 10000 });
  await page
    .locator("[data-native-v8-info-panel='true']")
    .waitFor({ state: "visible", timeout: 10000 });
}

async function openV8TopbarSection(page: Page, section: "export" | "repair") {
  const sectionButton = page
    .locator(
      `[data-native-v8-topbar='true'] [data-studio-action='section'][data-value='${section}']`,
    )
    .first();
  await expect(sectionButton).toBeVisible();
  await sectionButton.click();
  await expect(page.locator("[data-native-v8-info-panel='true']")).toBeVisible();
}

async function selectNativeViewportOption(
  page: Page,
  field: "presetId" | "fitMode",
  value: string,
) {
  const dropdown = page.locator(
    `.studio-native-v8-viewport__dropdown[data-viewport-field='${field}']`,
  );
  await expect(dropdown).toBeVisible();
  await dropdown.locator("summary").click();
  const option = dropdown.locator(
    `[data-studio-action='viewport-dropdown-option'][data-value='${value}']`,
  );
  await expect(option).toBeVisible();
  await option.evaluate((element) => (element as HTMLElement).click());
}

function acceptNextCanvasRegeneration(page: Page) {
  page.once("dialog", (dialog) => dialog.accept());
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

async function createSingleProvinceBurgMismatch(page: Page) {
  return page.evaluate(() => {
    const runtime = window as any;
    const pack = runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
    const activeStates = (pack.states || []).filter(
      (item: any) =>
        item && !item.removed && item.i > 0 && item.name && item.name !== "Neutrals",
    );
    const activeCultures = (pack.cultures || [])
      .filter((item: any) => item && !item.removed && item.i > 0 && item.name)
      .slice(0, 80);
    const activeBurgs = (pack.burgs || [])
      .filter((item: any) => item && !item.removed && item.i > 0 && item.name)
      .slice(0, 200);
    if (activeStates.length < 2 || !activeBurgs.length) return null;

    const stateIds = new Set(activeStates.map((state: any) => state.i));
    const burgIds = new Set(activeBurgs.map((burg: any) => burg.i));
    const cultureIds = new Set(activeCultures.map((culture: any) => culture.i));
    const fallbackStateId = activeStates[0].i;
    const fallbackCultureId = activeCultures[0]?.i || 0;

    activeStates.forEach((state: any) => {
      if (state.culture && !cultureIds.has(state.culture)) {
        state.culture = fallbackCultureId;
      }
      if (state.capital && !burgIds.has(state.capital)) state.capital = 0;
    });
    activeBurgs.forEach((burg: any) => {
      if (burg.state && !stateIds.has(burg.state)) burg.state = fallbackStateId;
      if (burg.culture && !cultureIds.has(burg.culture)) {
        burg.culture = fallbackCultureId;
      }
    });

    const activeProvinces = (pack.provinces || [])
      .filter((item: any) => item && !item.removed && item.i > 0 && item.name)
      .slice(0, 160);
    activeProvinces.forEach((province: any) => {
      if (province.state && !stateIds.has(province.state)) {
        province.state = fallbackStateId;
      }
      if (province.burg && !burgIds.has(province.burg)) province.burg = 0;
      const burg = province.burg ? pack.burgs?.[province.burg] : null;
      if (
        province.state &&
        burg &&
        burg.state !== undefined &&
        burg.state !== province.state
      ) {
        province.state = burg.state || fallbackStateId;
      }
    });

    const province = activeProvinces.find((item: any) => {
      const burg = item.burg ? pack.burgs?.[item.burg] : null;
      return burg && activeStates.some((state: any) => state.i !== burg.state);
    });
    const burg = province ? pack.burgs?.[province.burg] : null;
    const mismatchState = burg
      ? activeStates.find((state: any) => state.i !== burg.state)
      : null;
    if (!province || !burg || !mismatchState) return null;

    province.state = mismatchState.i;
    return {
      burgId: burg.i,
      burgState: burg.state,
      provinceId: province.i,
      provinceState: province.state,
    };
  });
}

async function canvasInteractionSnapshot(page: Page) {
  return page.evaluate(() => {
    const viewbox = document.getElementById("viewbox") as SVGGElement | null;
    const host = document.getElementById("studioMapHost") as HTMLElement | null;
    return {
      canvasTool: host?.dataset.canvasTool || "",
      hostPanX: host?.dataset.panX || "",
      hostPanY: host?.dataset.panY || "",
      viewboxTransform: viewbox?.getAttribute("transform") || "",
    };
  });
}

async function canvasLayoutSnapshot(page: Page) {
  return page.evaluate(() => {
    const root = document.getElementById("studioRoot") as HTMLElement | null;
    const stage = document.getElementById("studioStageViewport");
    const frame = document.getElementById("studioCanvasFrame");
    if (!stage || !frame) return null;
    const stageRect = stage.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    return {
      documentTheme: document.documentElement.dataset.studioTheme || "",
      frameFullyVisible:
        frameRect.left >= stageRect.left - 1 &&
        frameRect.top >= stageRect.top - 1 &&
        frameRect.right <= stageRect.right + 1 &&
        frameRect.bottom <= stageRect.bottom + 1,
      frameHeight: Math.round(frameRect.height),
      frameWidth: Math.round(frameRect.width),
      fitMode: (frame as HTMLElement).dataset.fitMode || "",
      orientation: (frame as HTMLElement).dataset.orientation || "",
      ratio: Math.round((frameRect.width / frameRect.height) * 1000) / 1000,
      rootTheme: root?.dataset.studioTheme || "",
      stageHeight: Math.round(stageRect.height),
      stageWidth: Math.round(stageRect.width),
    };
  });
}

async function expectV8InfoPanelOpen(page: Page) {
  await expect(page.locator("[data-native-v8-info-panel='true']")).toBeVisible();
  await expect(page.locator("#studioDirectStatesWorkbench")).toBeVisible();
}

async function getNativeAppOutsideDrawerPoint(page: Page) {
  return page.evaluate(() => {
    const app = document.querySelector(".studio-native-app");
    const stage = document.getElementById("studioStageViewport");
    if (!app || !stage) return null;
    const rect = stage.getBoundingClientRect();
    const safeSelectors = [
      ".studio-native-drawer",
      ".studio-native-iconbar",
      ".studio-native-topbar",
      ".studio-native-v8-canvas-tools",
      ".studio-native-layerbar",
      ".studio-native-v8-info-panel",
      ".studio-map-zoom",
      ".studio-native-biome-popover",
    ];
    const xSteps = 12;
    const ySteps = 8;
    for (let yi = 1; yi < ySteps; yi += 1) {
      for (let xi = 1; xi < xSteps; xi += 1) {
        const x = Math.round(rect.left + (rect.width * xi) / xSteps);
        const y = Math.round(rect.top + (rect.height * yi) / ySteps);
        const target = document.elementFromPoint(x, y);
        if (!target?.closest(".studio-native-app")) continue;
        if (safeSelectors.some((selector) => target.closest(selector))) continue;
        return { x, y };
      }
    }
    return null;
  });
}

test.describe("AGM self-owned UI V1 acceptance", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("agm-studio-language", "en");
    });
    await resetIndexedDbSnapshot(page);

    await page.goto("/?seed=test-studio-v1-acceptance&width=1280&height=720");
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
  });

  test("runs the V1 product path without old editor dialogs", async ({
    page,
  }) => {
    const projectHome = page.locator(".studio-project-home");
    await expect(projectHome).toBeVisible();
    await expect(projectHome).toContainText("Procedural world generation editor");
    await expect(
      projectHome.getByRole("button", { name: /Enter workbench/ }),
    ).toBeVisible();

    await enterNativeWorkbench(page);
    await expect(page.locator(".studio-native-iconbar")).toBeVisible();
    await expect(page.locator("[data-native-v8-canvas-tools='true']")).toBeVisible();
    await expect(page.locator("[data-native-v8-bottom-bar='true']")).toBeVisible();
    await expect(page.locator("#studioCanvasFrame")).toBeVisible();

    const initialSnapshot = await canvasInteractionSnapshot(page);
    expect(initialSnapshot.canvasTool).toBe("pan");

    const frame = await page.locator("#studioCanvasFrame").boundingBox();
    expect(frame).not.toBeNull();
    const clickPoint = {
      x: Math.round(frame!.x + frame!.width / 2),
      y: Math.round(frame!.y + frame!.height / 2),
    };
    await page.mouse.move(clickPoint.x, clickPoint.y);
    await page.mouse.wheel(0, -420);
    await page.waitForTimeout(180);
    const afterWheel = await canvasInteractionSnapshot(page);

    await page.mouse.click(clickPoint.x, clickPoint.y);
    await page.waitForTimeout(180);
    const afterClick = await canvasInteractionSnapshot(page);
    expect(afterClick.viewboxTransform).toBe(afterWheel.viewboxTransform);
    expect(afterClick.hostPanX).toBe(afterWheel.hostPanX);
    expect(afterClick.hostPanY).toBe(afterWheel.hostPanY);
    expect(afterClick.canvasTool).toBe("pan");

    const modules = [
      { key: "states", targetId: "studioDirectStatesWorkbench" },
      { key: "cultures", navKey: "states", targetId: "studioDirectCulturesWorkbench" },
      { key: "provinces", navKey: "states", targetId: "studioDirectProvincesWorkbench" },
      { key: "religions", navKey: "states", targetId: "studioDirectReligionsWorkbench" },
      { key: "burgs", navKey: "states", targetId: "studioDirectBurgsWorkbench" },
      { key: "routes", navKey: "mapFeatures", targetId: "studioDirectRoutesWorkbench" },
      { key: "biomes", targetId: "studioDirectBiomesWorkbench" },
      { key: "markers", navKey: "mapFeatures", targetId: "studioDirectMarkersWorkbench" },
      { key: "diplomacy", navKey: "states", targetId: "studioDirectDiplomacyWorkbench" },
      { key: "zones", navKey: "mapFeatures", targetId: "studioDirectZonesWorkbench" },
    ];

    for (const module of modules) {
      const navKey = module.navKey ?? module.key;
      const moduleButton = page.locator(
        `.studio-native-iconbar [data-studio-action='direct-workbench-jump'][data-value='${navKey}']`,
      );
      await expect(moduleButton).toBeVisible();
      await moduleButton.click();

      const drawer = page.locator("[data-native-v8-info-panel='true']");
      if (navKey !== module.key) {
        await drawer
          .locator(`[data-studio-action='direct-workbench-jump'][data-value='${module.key}']`)
          .click();
      }
      await expect(moduleButton).toHaveClass(/is-active/);
      await expect(drawer).toBeVisible();
      await expect(drawer.locator(`#${module.targetId}`)).toBeVisible();
      await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);
      await expect(page.locator("#studioCanvasFrame")).toBeVisible();
    }

    const mismatch = await createSingleProvinceBurgMismatch(page);
    expect(mismatch).not.toBeNull();

    await openV8TopbarSection(page, "export");
    const exportPanel = page.locator("[data-native-export-panel='true']");
    await expect(exportPanel).toBeVisible();
    await expect(
      exportPanel.locator("[data-relationship-export-gate='blocked']"),
    ).toBeVisible();
    await expect(
      exportPanel.locator(
        "[data-studio-action='project'][data-value='export-engine-package']",
      ),
    ).toBeDisabled();
    await expect(exportPanel.locator("[data-studio-action='run-export']")).toBeEnabled();
    await expect(
      exportPanel.locator(
        "[data-studio-action='project'][data-value='export-engine-manifest']",
      ),
    ).toBeEnabled();

    await exportPanel
      .locator("[data-studio-action='section'][data-value='repair']")
      .click();
    const repairCenter = page.locator("[data-native-repair-center='true']").first();
    await expect(repairCenter).toBeVisible();
    await expect(
      repairCenter.locator("[data-relationship-repair-health='blocked']"),
    ).toBeVisible();
    const mismatchGroup = repairCenter
      .locator("[data-direct-relationship-group='province-sync-burg-state']")
      .first();
    await expect(mismatchGroup).toContainText("Province burg state mismatch");
    await mismatchGroup
      .locator("[data-studio-action='direct-relationship-fix']")
      .filter({ hasText: "Sync to burg state" })
      .first()
      .click();

    await expect
      .poll(() =>
        page.evaluate((provinceId) => {
          const runtime = window as any;
          const pack =
            runtime.__agmActiveEngineRuntimeContext?.pack ?? runtime.pack;
          const province = pack.provinces[provinceId];
          const burg = province?.burg ? pack.burgs?.[province.burg] : null;
          return Boolean(province && burg && province.state === burg.state);
        }, mismatch!.provinceId),
      )
      .toBe(true);

    await openV8TopbarSection(page, "export");
    await expect(
      exportPanel.locator("[data-relationship-export-gate='ready']"),
    ).toBeVisible();
    await expect(
      exportPanel
        .locator("[data-studio-action='project'][data-value='export-engine-package']")
        .first(),
    ).toBeEnabled();
    await expect.poll(() => getVisibleLegacyDialogCount(page)).toBe(0);
  });

  test("keeps theme and common viewport presets inside the native container", async ({
    page,
  }) => {
    await enterNativeWorkbench(page);

    let snapshot = await canvasLayoutSnapshot(page);
    expect(snapshot).toMatchObject({
      documentTheme: "night",
      rootTheme: "night",
    });

    await page
      .locator("[data-studio-action='theme-toggle'][data-value='daylight']")
      .click();
    await expect
      .poll(() => canvasLayoutSnapshot(page))
      .toMatchObject({ documentTheme: "daylight", rootTheme: "daylight" });

    await page
      .locator("[data-studio-action='theme-toggle'][data-value='night']")
      .click();
    await expect
      .poll(() => canvasLayoutSnapshot(page))
      .toMatchObject({ documentTheme: "night", rootTheme: "night" });

    await selectNativeViewportOption(page, "fitMode", "contain");

    const presets = [
      { id: "desktop-landscape", label: "16:10", orientation: "landscape" },
      { id: "widescreen-landscape", label: "16:9", orientation: "landscape" },
      { id: "classic-landscape", label: "4:3", orientation: "landscape" },
      { id: "square", label: "1:1", orientation: "portrait" },
    ];

    for (const [index, preset] of presets.entries()) {
      if (index > 0) acceptNextCanvasRegeneration(page);
      await selectNativeViewportOption(page, "presetId", preset.id);
      await expect(
        page.locator(
          ".studio-native-v8-viewport__dropdown[data-viewport-field='presetId'] summary",
        ),
      ).toContainText(preset.label);
      await expect
        .poll(() => canvasLayoutSnapshot(page))
        .toMatchObject({
          fitMode: "contain",
          frameFullyVisible: true,
          orientation: preset.orientation,
        });
      snapshot = await canvasLayoutSnapshot(page);
      expect(snapshot?.frameWidth).toBeGreaterThan(0);
      expect(snapshot?.frameHeight).toBeGreaterThan(0);
      expect(snapshot?.frameWidth).toBeLessThanOrEqual(
        (snapshot?.stageWidth || 0) + 1,
      );
      expect(snapshot?.frameHeight).toBeLessThanOrEqual(
        (snapshot?.stageHeight || 0) + 1,
      );
    }
  });

  test("dismisses editor drawers from canvas clicks but keeps chrome clicks safe", async ({
    page,
  }) => {
    await enterNativeWorkbench(page);

    const statesButton = page.locator(
      ".studio-native-iconbar [data-studio-action='direct-workbench-jump'][data-value='states']",
    );
    await statesButton.click();
    await expectV8InfoPanelOpen(page);

    await page.locator("[data-studio-action='theme-toggle']").click();
    await expectV8InfoPanelOpen(page);

    await statesButton.click();
    await expectV8InfoPanelOpen(page);

    await page
      .locator(
        "[data-native-v8-canvas-tools='true'] [data-studio-action='canvas-tool'][data-value='select']",
      )
      .click();
    await expectV8InfoPanelOpen(page);

    await page
      .locator("[data-native-v8-bottom-bar='true'] [data-studio-action='layer']")
      .first()
      .click();
    await expectV8InfoPanelOpen(page);

    await page
      .locator(".studio-map-zoom [data-studio-action='viewport-zoom'][data-value='in']")
      .click();
    await expectV8InfoPanelOpen(page);

    const outsideDrawerPoint = await getNativeAppOutsideDrawerPoint(page);
    expect(outsideDrawerPoint).not.toBeNull();
    await page.mouse.click(outsideDrawerPoint!.x, outsideDrawerPoint!.y);
    await expectV8InfoPanelOpen(page);
    await expect(page.locator("#studioCanvasFrame")).toBeVisible();
  });
});
