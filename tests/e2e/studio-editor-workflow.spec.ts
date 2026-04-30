import {test, expect, type Page} from "@playwright/test";

test.describe.configure({timeout: 90000});

function editorDialog(page: Page, editorId: string) {
  return page.locator(`.ui-dialog:has(#${editorId})`);
}

function editorButton(page: Page, action: string) {
  return page.locator(`[data-studio-action='editor'][data-value='${action}']`);
}

function openEditorsWorkspace(page: Page) {
  return page.locator(".studio-nav [data-studio-action='section'][data-value='editors']").click();
}

function openRepairCenter(page: Page) {
  return page.locator(".studio-nav [data-studio-action='section'][data-value='repair']").click();
}

function sectionNav(page: Page, section: string) {
  return page.locator(`.studio-nav [data-studio-action='section'][data-value='${section}']`);
}

function nativeStatesChip(page: Page) {
  return page.locator(".studio-chip[data-studio-action='section'][data-value='editors']").filter({hasText: "States"}).first();
}

async function expectEditorState(
  page: Page,
  label: string,
) {
  const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
  const statusBar = page.locator(".studio-statusbar");

  await expect(editorsPanel).toContainText(`Open · ${label}`);
  await expect(editorsPanel).toContainText("Connected");
  await expect(statusBar).toContainText(`Editor: Open · ${label}`);
}

async function openEditor(
  page: Page,
  action: string,
  dialogId: string,
) {
  await editorButton(page, action).click();
  await editorDialog(page, dialogId).waitFor({state: "visible", timeout: 5000});
}

async function closeEditor(page: Page, dialogId: string) {
  await page.click(`.ui-dialog:has(#${dialogId}) .ui-dialog-titlebar-close`);
}

async function closeEditorFromEditorSurface(page: Page, dialogId: string) {
  await page.evaluate((id: string) => {
    const dialog = document.getElementById(id);
    if (!dialog) return;

    const jquery = (window as any).$;
    if (typeof jquery === "function" && jquery(dialog).data("ui-dialog")) {
      jquery(dialog).dialog("close");
      return;
    }

    dialog.closest(".ui-dialog")?.querySelector<HTMLButtonElement>(".ui-dialog-titlebar-close")?.click();
  }, dialogId);
}

async function openEditorFromExternalSurface(page: Page, action: string, dialogId: string) {
  await page.evaluate(async (editorAction: string) => {
    const handler = (window as unknown as Record<string, unknown>)[editorAction];
    if (typeof handler === "function") await (handler as () => unknown)();
  }, action);
  await editorDialog(page, dialogId).waitFor({state: "visible", timeout: 5000});
}

async function getVisibleDialogCount(page: Page) {
  return page.locator(".ui-dialog").evaluateAll(dialogs =>
    dialogs.filter(dialog => {
      const element = dialog as HTMLElement;
      if (element.hidden || element.offsetParent === null) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length,
  );
}

async function getCanvasClientPoint(page: Page, worldX: number, worldY: number) {
  return page.evaluate(
    ({worldX, worldY}) => {
      const frame = document.getElementById("studioCanvasFrame") as HTMLElement;
      const host = document.getElementById("studioMapHost") as HTMLElement | null;
      const rect = frame.getBoundingClientRect();
      const graphWidth = Number((window as any).graphWidth || 1);
      const graphHeight = Number((window as any).graphHeight || 1);
      const fitMode = frame.dataset.fitMode || "contain";
      const fitScale = fitMode === "actual-size"
        ? 1
        : fitMode === "cover"
          ? Math.max(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight)
          : Math.min(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight);
      const panX = Number(host?.dataset.panX || "0");
      const panY = Number(host?.dataset.panY || "0");
      const originX = (frame.offsetWidth - graphWidth * fitScale) / 2 + panX;
      const originY = (frame.offsetHeight - graphHeight * fitScale) / 2 + panY;
      return {
        x: rect.left + (originX + worldX * fitScale) * (rect.width / frame.offsetWidth),
        y: rect.top + (originY + worldY * fitScale) * (rect.height / frame.offsetHeight),
      };
    },
    {worldX, worldY},
  );
}

async function getVisibleCanvasStatePoint(page: Page) {
  return page.evaluate(() => {
    const getClientPoint = (point: [number, number]) => {
      const frame = document.getElementById("studioCanvasFrame") as HTMLElement;
      const host = document.getElementById("studioMapHost") as HTMLElement | null;
      const rect = frame.getBoundingClientRect();
      const graphWidth = Number((window as any).graphWidth || 1);
      const graphHeight = Number((window as any).graphHeight || 1);
      const fitMode = frame.dataset.fitMode || "contain";
      const fitScale = fitMode === "actual-size"
        ? 1
        : fitMode === "cover"
          ? Math.max(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight)
          : Math.min(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight);
      const panX = Number(host?.dataset.panX || "0");
      const panY = Number(host?.dataset.panY || "0");
      const originX = (frame.offsetWidth - graphWidth * fitScale) / 2 + panX;
      const originY = (frame.offsetHeight - graphHeight * fitScale) / 2 + panY;
      return {
        x: rect.left + (originX + point[0] * fitScale) * (rect.width / frame.offsetWidth),
        y: rect.top + (originY + point[1] * fitScale) * (rect.height / frame.offsetHeight),
      };
    };
    const isVisibleCanvasPoint = (point: [number, number]) => {
      const client = getClientPoint(point);
      const stage = document.getElementById("studioStageViewport")!.getBoundingClientRect();
      const target = document.elementFromPoint(client.x, client.y);
      return (
        client.x >= stage.left + 8 &&
        client.x <= stage.right - 8 &&
        client.y >= stage.top + 8 &&
        client.y <= stage.bottom - 8 &&
        Boolean(target?.closest?.("#studioCanvasFrame"))
      );
    };
    const pack = (window as any).pack;
    const cells = pack.cells;
    const cellId = (Array.from(cells.i || []) as number[]).find(id => {
      const stateId = Number(cells.state[id]);
      const point = cells.p[id] as [number, number] | undefined;
      return stateId > 0 && pack.states[stateId] && !pack.states[stateId].removed && Array.isArray(point) && cells.h[id] >= 20 && isVisibleCanvasPoint(point);
    });
    if (cellId === undefined) throw new Error("No visible canvas state cell found");
    const stateId = Number(cells.state[cellId]);
    const point = cells.p[cellId];
    return {cellId, stateId, stateName: pack.states[stateId].name, x: point[0], y: point[1]};
  });
}

async function getVisibleCanvasLandCellPoint(page: Page, paintable = false) {
  return page.evaluate(
    ({paintable}) => {
      const getClientPoint = (point: [number, number]) => {
        const frame = document.getElementById("studioCanvasFrame") as HTMLElement;
        const host = document.getElementById("studioMapHost") as HTMLElement | null;
        const rect = frame.getBoundingClientRect();
        const graphWidth = Number((window as any).graphWidth || 1);
        const graphHeight = Number((window as any).graphHeight || 1);
        const fitMode = frame.dataset.fitMode || "contain";
        const fitScale = fitMode === "actual-size"
          ? 1
          : fitMode === "cover"
            ? Math.max(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight)
            : Math.min(frame.offsetWidth / graphWidth, frame.offsetHeight / graphHeight);
        const panX = Number(host?.dataset.panX || "0");
        const panY = Number(host?.dataset.panY || "0");
        const originX = (frame.offsetWidth - graphWidth * fitScale) / 2 + panX;
        const originY = (frame.offsetHeight - graphHeight * fitScale) / 2 + panY;
        return {
          x: rect.left + (originX + point[0] * fitScale) * (rect.width / frame.offsetWidth),
          y: rect.top + (originY + point[1] * fitScale) * (rect.height / frame.offsetHeight),
        };
      };
      const isVisibleCanvasPoint = (point: [number, number]) => {
        const client = getClientPoint(point);
        const stage = document.getElementById("studioStageViewport")!.getBoundingClientRect();
        const target = document.elementFromPoint(client.x, client.y);
        return (
          client.x >= stage.left + 8 &&
          client.x <= stage.right - 8 &&
          client.y >= stage.top + 8 &&
          client.y <= stage.bottom - 8 &&
          Boolean(target?.closest?.("#studioCanvasFrame"))
        );
      };
      const cells = (window as any).pack.cells;
      const cellId = (Array.from(cells.i || []) as number[]).find(id => {
        const point = cells.p[id] as [number, number] | undefined;
        const height = Number(cells.h[id]);
        const biome = Number(cells.biome[id]);
        return Array.isArray(point) && height >= 20 && (!paintable || (height <= 90 && biome !== 1)) && isVisibleCanvasPoint(point);
      });
      if (cellId === undefined) throw new Error("No visible canvas land cell found");
      const point = cells.p[cellId];
      return {cellId, beforeHeight: cells.h[cellId], beforeBiome: cells.biome[cellId], x: point[0], y: point[1]};
    },
    {paintable},
  );
}

const editorCases = [
  {action: "editCultures", dialogId: "culturesEditor", label: "Cultures"},
  {action: "editReligions", dialogId: "religionsEditor", label: "Religions"},
  {action: "editBiomes", dialogId: "biomesEditor", label: "Biomes"},
  {action: "editProvinces", dialogId: "provincesEditor", label: "Provinces"},
  {action: "editZones", dialogId: "zonesEditor", label: "Zones"},
  {action: "editDiplomacy", dialogId: "diplomacyEditor", label: "Diplomacy"},
] as const;


test.describe("Studio editor workflow", () => {
  test.beforeEach(async ({context, page}) => {
    await context.clearCookies();

    await page.goto("/", {waitUntil: "domcontentloaded"});
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("agm-studio-language", "en");
    });

    await page.goto("/?seed=test-studio-workflow&width=1280&height=720");
    await page.waitForFunction(() => (window as any).mapId !== undefined, {timeout: 60000});
    await page.locator("#studioApp").waitFor({state: "visible", timeout: 10000});
    await page.waitForFunction(
      () => {
        const loading = document.getElementById("loading") as HTMLElement | null;
        const loadingHidden = !loading || Number.parseFloat(window.getComputedStyle(loading).opacity || "1") < 0.1;
        return loadingHidden && typeof (window as any).editStates === "function" && typeof (window as any).editCultures === "function";
      },
      {timeout: 15000},
    );
    await page.waitForTimeout(500);
  });

  test("switches canvas map tools and shows tool overlays", async ({page}) => {
    const mapTools = page.locator("[data-studio-map-tools='true']");
    const toolHud = page.locator("[data-canvas-tool-hud='true']");
    const toolGrid = page.locator(".studio-canvas-frame__overlay--tool-grid");
    const measureOverlay = page.locator(".studio-canvas-frame__overlay--measure");

    await expect(mapTools).toBeVisible();
    await expect(mapTools).toHaveAttribute("data-active-tool", "select");
    await expect(mapTools.locator("[data-studio-action='canvas-tool']")).toHaveCount(7);
    await expect(toolHud).toHaveAttribute("data-active-tool", "select");
    await expect(toolHud).toContainText("Select");

    await mapTools.locator("[data-studio-action='canvas-tool'][data-value='grid']").click();
    await expect(page.locator("[data-studio-map-tools='true']")).toHaveAttribute("data-active-tool", "grid");
    await expect(page.locator("[data-canvas-tool-hud='true']")).toHaveAttribute("data-active-tool", "grid");
    await expect(toolGrid).toBeVisible();
    await expect(measureOverlay).toBeHidden();

    await page.locator("[data-studio-map-tools='true'] [data-studio-action='canvas-tool'][data-value='measure']").click();
    await expect(page.locator("[data-studio-map-tools='true']")).toHaveAttribute("data-active-tool", "measure");
    await expect(page.locator("[data-canvas-tool-hud='true']")).toContainText("Measure");
    await expect(toolGrid).toBeHidden();
    await expect(measureOverlay).toBeVisible();
  });

  test("selects and pans the canvas with map tools", async ({page}) => {
    const mapTools = page.locator("[data-studio-map-tools='true']");
    const frame = page.locator("#studioCanvasFrame");
    const host = page.locator("#studioMapHost");
    const toolHud = page.locator("[data-canvas-tool-hud='true']");

    await sectionNav(page, "canvas").click();
    await expect(sectionNav(page, "canvas")).toHaveClass(/is-active/);
    await expect(host).toHaveAttribute("data-canvas-tool", "select");
    const statePoint = await getVisibleCanvasStatePoint(page);
    const stateClientPoint = await getCanvasClientPoint(page, statePoint.x, statePoint.y);
    await page.mouse.click(stateClientPoint.x, stateClientPoint.y);
    await expect(toolHud).toHaveAttribute("data-selected-canvas-entity", `state:${statePoint.stateId}`);
    await expect(page.locator("#studioCanvasFrame [data-canvas-selection-card='true']")).toHaveCount(0);
    await expect(page.locator(".studio-sidebar--right [data-canvas-selection-card='true']")).toHaveAttribute("data-selected-state-id", String(statePoint.stateId));
    await expect(page.locator(".studio-sidebar--right [data-canvas-selection-card='true']")).toContainText(statePoint.stateName);
    await expect(host).toHaveAttribute("data-selected-state-id", String(statePoint.stateId));
    await expect(page.locator(`#state${statePoint.stateId}`)).toHaveAttribute("data-studio-selected-state", "true");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveCount(0);

    await mapTools.locator("[data-studio-action='canvas-tool'][data-value='pan']").click();
    await expect(host).toHaveAttribute("data-canvas-tool", "pan");
    const panBox = await frame.boundingBox();
    expect(panBox).not.toBeNull();
    await page.mouse.move(panBox!.x + panBox!.width * 0.45, panBox!.y + panBox!.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(panBox!.x + panBox!.width * 0.55, panBox!.y + panBox!.height * 0.52, {steps: 4});
    await page.mouse.up();
    await expect.poll(() => page.locator("[data-canvas-tool-hud='true']").getAttribute("data-pan-x")).not.toBe("0");
  });

  test("edits selected kingdom from the canvas selection card", async ({page}) => {
    await sectionNav(page, "canvas").click();
    await expect(sectionNav(page, "canvas")).toHaveClass(/is-active/);

    const statePoint = await getVisibleCanvasStatePoint(page);
    const clientPoint = await getCanvasClientPoint(page, statePoint.x, statePoint.y);
    await page.mouse.click(clientPoint.x, clientPoint.y);

    await expect(page.locator("#studioCanvasFrame [data-canvas-selection-card='true']")).toHaveCount(0);
    const card = page.locator(".studio-sidebar--right [data-canvas-selection-card='true']");
    await expect(card).toHaveAttribute("data-selected-state-id", String(statePoint.stateId));
    const nextName = `Canvas State ${statePoint.stateId}`;
    const nextFullName = `${nextName} Realm`;
    await card.locator("[data-canvas-state-field='name']").fill(nextName);
    await card.locator("[data-canvas-state-field='fullName']").fill(nextFullName);
    await card.locator("[data-canvas-state-field='formName']").fill("Canvas Kingdom");
    await card.locator("[data-canvas-state-field='color']").fill("#aa6633");
    await card.locator("[data-canvas-state-field='population']").fill("654321");
    await expect(card.locator("[data-canvas-state-edit-status='true']")).toHaveAttribute("data-status", "dirty");

    await card.locator("[data-studio-action='canvas-state-apply']").click();
    await expect(page.locator(".studio-sidebar--right [data-canvas-selection-card='true']")).toContainText(nextFullName);
    await expect(page.locator(`#state${statePoint.stateId}`)).toHaveAttribute("data-studio-selected-state", "true");
    await expect.poll(() => page.evaluate(id => {
      const state = (window as any).pack.states[id];
      return {name: state.name, fullName: state.fullName, formName: state.formName, color: state.color, population: state.population};
    }, statePoint.stateId)).toEqual({name: nextName, fullName: nextFullName, formName: "Canvas Kingdom", color: "#aa6633", population: 654321});
  });

  test("previews brush water and terrain canvas targets", async ({page}) => {
    const mapTools = page.locator("[data-studio-map-tools='true']");
    const preview = page.locator("[data-canvas-paint-preview='true']");
    const toolHud = page.locator("[data-canvas-tool-hud='true']");

    const cellPoint = await getVisibleCanvasLandCellPoint(page);
    const cellClientPoint = await getCanvasClientPoint(page, cellPoint.x, cellPoint.y);

    for (const tool of ["brush", "water", "terrain"] as const) {
      await mapTools.locator(`[data-studio-action='canvas-tool'][data-value='${tool}']`).click();
      await expect(page.locator("#studioMapHost")).toHaveAttribute("data-canvas-tool", tool);
      await page.mouse.move(cellClientPoint.x, cellClientPoint.y);
      await expect(preview).toHaveAttribute("data-preview-tool", tool);
      await expect(preview).toHaveAttribute("data-preview-cell", /\d+/);
      await expect(toolHud).toHaveAttribute("data-preview-cell", /\d+/);
      await expect(toolHud).toContainText("Painting Cell #");
    }
  });

  test("paints and undoes canvas terrain brush and water edits immediately", async ({page}) => {
    const mapTools = page.locator("[data-studio-map-tools='true']");
    const toolHud = page.locator("[data-canvas-tool-hud='true']");

    const cellPoint = await getVisibleCanvasLandCellPoint(page, true);
    const cellClientPoint = await getCanvasClientPoint(page, cellPoint.x, cellPoint.y);

    await mapTools.locator("[data-studio-action='canvas-tool'][data-value='terrain']").click();
    await page.mouse.click(cellClientPoint.x, cellClientPoint.y);
    await expect(toolHud).toHaveAttribute("data-edit-count", "1");
    await expect(toolHud).toHaveAttribute("data-latest-edit-cell", String(cellPoint.cellId));
    await expect(toolHud).toHaveAttribute("data-latest-edit-after-height", String(cellPoint.beforeHeight + 5));
    const terrainSnapshot = await page.evaluate(cellId => {
      const packCells = (window as any).pack.cells;
      const gridCells = (window as any).grid.cells;
      return {
        packHeight: packCells.h[cellId],
        gridCellId: packCells.g[cellId],
        gridHeight: gridCells.h[packCells.g[cellId]],
      };
    }, cellPoint.cellId);
    expect(terrainSnapshot).toEqual({packHeight: cellPoint.beforeHeight + 5, gridCellId: terrainSnapshot.gridCellId, gridHeight: cellPoint.beforeHeight + 5});

    await page.locator("[data-studio-action='canvas-edit-undo']").click();
    await expect.poll(() => page.evaluate(cellId => (window as any).pack.cells.h[cellId], cellPoint.cellId)).toBe(cellPoint.beforeHeight);

    await mapTools.locator("[data-studio-action='canvas-tool'][data-value='brush']").click();
    await page.mouse.click(cellClientPoint.x, cellClientPoint.y);
    await expect.poll(() => page.evaluate(cellId => (window as any).pack.cells.biome[cellId], cellPoint.cellId)).toBe(1);
    await page.locator("[data-studio-action='canvas-edit-undo']").click();
    await expect.poll(() => page.evaluate(cellId => (window as any).pack.cells.biome[cellId], cellPoint.cellId)).toBe(cellPoint.beforeBiome);

    await mapTools.locator("[data-studio-action='canvas-tool'][data-value='water']").click();
    await page.mouse.click(cellClientPoint.x, cellClientPoint.y);
    await expect.poll(() => page.evaluate(cellId => (window as any).pack.cells.h[cellId], cellPoint.cellId)).toBeLessThan(20);
    await page.locator("[data-studio-action='canvas-edit-undo']").click();
    await expect.poll(() => page.evaluate(cellId => (window as any).pack.cells.h[cellId], cellPoint.cellId)).toBe(cellPoint.beforeHeight);
  });

  test("shows biome distribution insights in the canvas inspector", async ({page}) => {
    await expect(sectionNav(page, "project")).toHaveClass(/is-active/);

    const rightSidebar = page.locator(".studio-sidebar--right");
    await expect(rightSidebar.locator("[data-studio-biome-insights='true']")).toHaveCount(0);
    await expect(page.locator("#studioCanvasFrameScaler [data-studio-biome-insights='true']")).toHaveCount(0);

    await sectionNav(page, "canvas").click();
    await expect(sectionNav(page, "canvas")).toHaveClass(/is-active/);

    const biomeInsights = rightSidebar.locator("[data-studio-biome-insights='true']");

    await expect(biomeInsights).toHaveCount(1);
    await expect(biomeInsights).toBeVisible();
    await expect(biomeInsights).toHaveAttribute("data-biome-count", /[1-9]/);
    await expect(biomeInsights).toContainText("Biomes");
    await expect(biomeInsights.locator("[data-biome-percentage]")).not.toHaveCount(0);
    await expect(biomeInsights.locator(".studio-biome-insights__slice")).not.toHaveCount(0);
    await expect(biomeInsights.locator(".studio-biome-insights__donut svg")).toHaveCount(1);
    await expect(page.locator("#studioCanvasFrameScaler [data-studio-biome-insights='true']")).toHaveCount(0);

    for (const section of ["style", "layers", "export", "data"] as const) {
      await sectionNav(page, section).click();
      await expect(sectionNav(page, section)).toHaveClass(/is-active/);
      await expect(rightSidebar.locator("[data-studio-biome-insights='true']")).toHaveCount(0);
    }

    await sectionNav(page, "canvas").click();
    await expect(sectionNav(page, "canvas")).toHaveClass(/is-active/);
    await expect(biomeInsights).toHaveCount(1);

    await sectionNav(page, "project").click();
    await expect(sectionNav(page, "project")).toHaveClass(/is-active/);
    await expect(page.locator(".studio-pipeline-step")).toHaveCount(0);
    await expect(page.locator(".studio-pipeline")).toHaveCount(0);

    await sectionNav(page, "canvas").click();
    await expect(sectionNav(page, "canvas")).toHaveClass(/is-active/);

    const firstSlice = biomeInsights.locator(".studio-biome-insights__slice").first();
    const sliceBiomeId = await firstSlice.getAttribute("data-biome-id");
    expect(sliceBiomeId).toBeTruthy();
    await firstSlice.evaluate(element => element.dispatchEvent(new MouseEvent("click", {bubbles: true})));
    await expect(biomeInsights).toHaveAttribute("data-active-biome-id", sliceBiomeId!);
    await expect(firstSlice).toHaveAttribute("data-biome-active", "true");
    await expect(biomeInsights.locator(`.studio-biome-insights__row[data-biome-id='${sliceBiomeId}']`)).toHaveAttribute("data-biome-active", "true");

    const coverageSlider = biomeInsights.locator(`[data-studio-action='biome-coverage-slider'][data-biome-id='${sliceBiomeId}']`);
    await expect(coverageSlider).toHaveCount(1);
    const beforeBiomeCellCount = await page.evaluate(id => Array.from((window as any).pack.cells.biome).filter(value => Number(value) === Number(id)).length, sliceBiomeId);
    const nextCoverage = Math.min(80, Math.max(1, Math.round(Number(await coverageSlider.inputValue()) + 4)));
    await coverageSlider.evaluate((element, value) => {
      const input = element as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
    }, String(nextCoverage));
    await expect.poll(() => page.evaluate(id => Array.from((window as any).pack.cells.biome).filter(value => Number(value) === Number(id)).length, sliceBiomeId)).not.toBe(beforeBiomeCellCount);
  });

  test("persists Studio theme selection", async ({page}) => {
    const themeSelect = page.locator("#studioThemeSelect");
    const themeToggle = page.locator("[data-studio-action='theme-toggle']");
    const studioRoot = page.locator("#studioRoot");

    await expect(themeSelect).toBeAttached();
    await expect(themeSelect).toBeHidden();
    await expect(themeToggle).toBeVisible();
    await expect(themeSelect).toHaveValue("night");
    await expect(studioRoot).toHaveAttribute("data-studio-theme", "night");
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.studioTheme)).toBe("night");
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.querySelector("#studioApp")!).backgroundColor,
        ),
      )
      .not.toBe("rgb(255, 255, 255)");

    await themeToggle.click();
    await expect(page.locator("#studioThemeSelect")).toHaveValue("daylight");
    await expect(studioRoot).toHaveAttribute("data-studio-theme", "daylight");
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.studioTheme)).toBe("daylight");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("agm-studio-theme"))).toBe("daylight");
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.querySelector("#studioApp")!).backgroundColor,
        ),
      )
      .toBe("rgb(245, 246, 248)");

    await page.reload({waitUntil: "domcontentloaded"});
    await page.waitForFunction(() => (window as any).mapId !== undefined, {timeout: 60000});
    await page.locator("#studioApp").waitFor({state: "visible", timeout: 10000});
    await expect(page.locator("#studioThemeSelect")).toHaveValue("daylight");
    await expect(page.locator("#studioRoot")).toHaveAttribute("data-studio-theme", "daylight");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("agm-studio-theme"))).toBe("daylight");
  });

  test("collapses and persists the primary navigation", async ({page}) => {
    const studioApp = page.locator("#studioApp");
    const collapseToggle = page.locator("[data-studio-action='toggle-navigation-collapse']");

    await expect(collapseToggle).toBeVisible();
    await expect(studioApp).not.toHaveClass(/is-nav-collapsed/);
    await expect(studioApp).toHaveAttribute("data-navigation-collapsed", "false");

    await collapseToggle.click();
    await expect(studioApp).toHaveClass(/is-nav-collapsed/);
    await expect(studioApp).toHaveAttribute("data-navigation-collapsed", "true");
    await expect(page.locator(".studio-nav__label-wrap").first()).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            getComputedStyle(document.querySelector(".studio-body")!)
              .gridTemplateColumns,
        ),
      )
      .toContain("72px");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("agm-studio-navigation-collapsed"))).toBe("true");

    await page.reload({waitUntil: "domcontentloaded"});
    await page.waitForFunction(() => (window as any).mapId !== undefined, {timeout: 60000});
    await page.locator("#studioApp").waitFor({state: "visible", timeout: 10000});
    await expect(page.locator("#studioApp")).toHaveClass(/is-nav-collapsed/);
    await expect(page.locator("#studioApp")).toHaveAttribute("data-navigation-collapsed", "true");
  });

  test("jumps between native editor workbenches from the directory", async ({page}) => {
    await openEditorsWorkspace(page);

    await expect(sectionNav(page, "repair")).toBeVisible();
    await expect(sectionNav(page, "repair")).toContainText("Validate");

    const directory = page.locator(".studio-direct-workbench-directory").first();
    await expect(directory).toContainText("Workbench directory");
    await expect(directory).toContainText("Records");
    await expect(directory).toContainText("Selected");
    await expect(directory).toContainText("Applied");
    await expect(directory).toContainText("Filters");
    await expect(directory.locator("[data-studio-action='direct-workbench-jump']")).toHaveCount(9);

    const clearFilters = directory.locator("[data-studio-action='direct-workbench-clear-filters']");
    const reviewApplied = directory.locator("[data-studio-action='direct-workbench-review-applied']");
    await expect(clearFilters).toBeDisabled();
    await expect(reviewApplied).toBeDisabled();
    await expect(directory.locator("[data-direct-applied-summary='true']")).toHaveText("—");
    await expect(directory.locator("[data-direct-relationship-summary='true']")).toContainText(/Healthy|mismatch|Missing/);
    await expect(directory.locator("[data-direct-relationship-queue='true']")).toHaveCount(0);
    await expect(directory.locator("[data-direct-relationship-issues='true']")).toHaveCount(0);
    await expect(directory.locator("[data-studio-action='direct-workbench-open-repair']")).toBeVisible();
    await directory.locator("[data-studio-action='direct-workbench-open-repair']").click();
    const repairCenter = page.locator(".studio-repair-center").first();
    await expect(sectionNav(page, "repair")).toHaveClass(/is-active/);
    await expect(repairCenter).toContainText("Repair Center");
    await expect(repairCenter.locator("[data-direct-relationship-issues='true']")).toHaveCount(1);
    await openEditorsWorkspace(page);

    await page.locator("#studioStateSearchInput").fill("zz-no-state-match");
    await expect(directory.locator("[data-workbench-key='states']")).toHaveAttribute("data-workbench-filters", "1");
    await expect(clearFilters).toBeEnabled();

    await clearFilters.click();
    await expect(page.locator("#studioStateSearchInput")).toHaveValue("");
    await expect(directory.locator("[data-workbench-key='states']")).toHaveAttribute("data-workbench-filters", "0");
    await expect(clearFilters).toBeDisabled();

    const statesItem = directory.locator("[data-studio-action='direct-workbench-jump'][data-workbench-key='states']");
    await expect(statesItem).toHaveAttribute("data-workbench-count", /\d+/);
    await expect(statesItem).toHaveAttribute("data-workbench-selected", /#\d+/);
    await expect(statesItem).toContainText("Records");

    await directory.locator("[data-studio-action='direct-workbench-jump'][data-workbench-key='diplomacy']").click();
    await expect(page.locator("#studioDirectDiplomacyWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectDiplomacyWorkbench")).toContainText("Diplomacy Workbench");
    await expect(directory.locator("[data-workbench-key='diplomacy']")).toHaveClass(/is-active/);

    await directory.locator("[data-studio-action='direct-workbench-jump'][data-workbench-key='biomes']").click();
    await expect(page.locator("#studioDirectBiomesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectBiomesWorkbench")).toContainText("Biomes / Resources Workbench");
    await expect(directory.locator("[data-workbench-key='biomes']")).toHaveClass(/is-active/);
  });

  test("flags and assists relationship issues in the native workbench directory", async ({page}) => {
    const mismatch = await page.evaluate(() => {
      const pack = (window as any).pack;
      const province = (pack.provinces || []).find((item: any) => item && !item.removed && item.i > 0 && item.burg);
      const states = (pack.states || []).filter((item: any) => item && !item.removed && item.i > 0 && item.name && item.name !== "Neutrals");
      if (!province || states.length < 2) return null;
      const burg = pack.burgs[province.burg];
      const mismatchState = states.find((item: any) => item.i !== burg.state) || states[0];
      province.state = mismatchState.i;
      return {provinceId: province.i, burgState: burg.state};
    });
    expect(mismatch).not.toBeNull();
    await openRepairCenter(page);

    const directory = page.locator(".studio-direct-workbench-directory").first();
    const reviewRelationship = directory.locator(".studio-direct-workbench-directory__summary [data-studio-action='direct-workbench-review-relationship']");
    const issueDetails = directory.locator("[data-direct-relationship-issues='true']");
    const issueCard = issueDetails.locator(".studio-direct-workbench-directory__issue-main").filter({hasText: "Province burg state mismatch"}).first();
    const mismatchIssue = issueDetails.locator(".studio-direct-workbench-directory__issue").filter({hasText: "Province burg state mismatch"}).first();
    const fixButton = issueDetails.locator("[data-studio-action='direct-relationship-fix']").filter({hasText: "Sync to burg state"}).first();
    await expect(directory.locator("[data-direct-relationship-summary='true']")).toContainText("Province burg state mismatch");
    await expect(issueDetails).toContainText("Relationship issue details");
    await expect(issueCard).toContainText("Province");
    await expect(issueCard).toContainText("Province state");
    await expect(issueCard).toContainText("The province state does not match the burg's state.");
    await expect(mismatchIssue.locator("[data-direct-relationship-preview='true']")).toContainText("Repair preview");
    await expect(mismatchIssue.locator("[data-direct-relationship-preview='true']")).toContainText(`→ #${mismatch!.burgState}`);
    await expect(fixButton).toHaveAttribute("data-province-state", String(mismatch!.burgState));
    await expect(reviewRelationship).toBeEnabled();
    await expect(reviewRelationship).toHaveAttribute("data-workbench-target", "studioDirectProvincesWorkbench");
    await issueCard.click();
    await expect(page.locator("#studioDirectProvincesWorkbench")).toHaveClass(/is-jump-highlight/);
    await openRepairCenter(page);

    await fixButton.click();
    await expect(directory.locator("[data-direct-applied-summary='true']")).toContainText(`Provinces #${mismatch!.provinceId}`);
    await expect.poll(() => page.evaluate((provinceId) => {
      const pack = (window as any).pack;
      const province = pack.provinces[provinceId];
      const burg = pack.burgs[province.burg];
      return province.state === burg.state;
    }, mismatch!.provinceId)).toBe(true);
    await expect(directory.locator("[data-direct-relationship-summary='true']")).not.toContainText("Province burg state mismatch");
  });

  test("expands hidden relationship issues in the native workbench directory", async ({page}) => {
    const broken = await page.evaluate(() => {
      const pack = (window as any).pack;
      const states = (pack.states || []).filter((item: any) => item && !item.removed && item.i > 0 && item.name && item.name !== "Neutrals").slice(0, 6);
      if (states.length < 6) return null;
      states.forEach((state: any, index: number) => {
        state.culture = 999991 + index;
      });
      return {
        ids: states.map((state: any) => state.i),
        names: states.map((state: any) => state.name),
      };
    });
    expect(broken).not.toBeNull();
    await openRepairCenter(page);

    const directory = page.locator(".studio-direct-workbench-directory").first();
    const issueDetails = directory.locator("[data-direct-relationship-issues='true']");
    const cultureGroup = issueDetails.locator("[data-direct-relationship-group='state-clear-culture']").first();
    await expect(cultureGroup.locator(".studio-direct-workbench-directory__issue-group-main strong")).toHaveText("6");
    const batchGuard = cultureGroup.locator("[data-direct-relationship-batch-guard='true']");
    await expect(batchGuard).toHaveAttribute("data-visible-count", "3");
    await expect(batchGuard).toHaveAttribute("data-hidden-count", "3");
    await expect(batchGuard).toContainText("Visible: 3 / 6");
    await expect(batchGuard).toContainText("Hidden: 3");
    await expect(batchGuard).toContainText("Clear group / Queue group affect the whole group; Replace visible only affects currently visible candidates.");
    const hiddenIssues = cultureGroup.locator("[data-direct-relationship-hidden-issues='true']");
    await expect(hiddenIssues).toHaveAttribute("data-hidden-count", "3");
    await expect(hiddenIssues).toHaveAttribute("data-page-size", "2");
    await expect(hiddenIssues.locator("summary")).toContainText("Expand hidden issues");
    await expect(hiddenIssues.locator("summary")).toContainText("Hidden issues are paged in segments; Replace visible does not affect this list.");
    const hiddenPagination = hiddenIssues.locator("[data-direct-relationship-hidden-pagination='true']");
    await expect(hiddenPagination).toHaveAttribute("data-active-page", "0");
    await expect(hiddenPagination.locator("[data-studio-action='direct-relationship-hidden-page']")).toHaveCount(2);
    await expect(hiddenPagination.locator("[data-hidden-page='0']")).toHaveAttribute("data-page-count", "2");
    await expect(hiddenPagination.locator("[data-hidden-page='1']")).toHaveAttribute("data-page-count", "1");
    const hiddenPageOne = hiddenIssues.locator("[data-direct-relationship-hidden-page='true'][data-hidden-page='0']");
    const hiddenPageTwo = hiddenIssues.locator("[data-direct-relationship-hidden-page='true'][data-hidden-page='1']");
    const hiddenIssue = hiddenPageOne.locator(".studio-direct-workbench-directory__issue").first();
    await expect(hiddenIssue).toBeHidden();
    await hiddenIssues.locator("summary").click();
    await expect(hiddenPageOne).toBeVisible();
    await expect(hiddenPageTwo).toBeHidden();
    const hiddenPageOneScope = hiddenPageOne.locator("[data-direct-relationship-hidden-page-scope='true']");
    await expect(hiddenPageOneScope).toHaveAttribute("data-page-start", "4");
    await expect(hiddenPageOneScope).toHaveAttribute("data-page-end", "5");
    await expect(hiddenPageOneScope).toHaveAttribute("data-page-count", "2");
    await expect(hiddenPageOneScope).toContainText("Current page: 4-5 / 6");
    await expect(hiddenPageOneScope).toContainText("Only affects hidden issues on this page; Queue group still covers every issue.");
    await expect(hiddenPageOneScope).toHaveAttribute("data-recovery-path", "Page recovery path: Queue page → Apply queue → History details → Restore to After / Undo");
    await expect(hiddenPageOneScope.locator("[data-direct-relationship-hidden-page-recovery-path='true']")).toContainText("Page recovery path: Queue page → Apply queue → History details → Restore to After / Undo");
    await expect(hiddenPageOneScope).toHaveAttribute("data-review-target", "States workbench · Culture field");
    await expect(hiddenPageOneScope.locator("[data-direct-relationship-hidden-page-review-target='true']")).toContainText("Review target: States workbench · Culture field");
    await expect(hiddenPageOneScope.locator("[data-studio-action='direct-relationship-review-page']")).toHaveAttribute("data-page-count", "2");
    await expect(hiddenPageOneScope.locator("[data-studio-action='direct-relationship-review-page']")).toHaveAttribute("data-edit-id", String(broken!.ids[3]));
    await expect(hiddenPageOneScope.locator("[data-studio-action='direct-relationship-queue-page']")).toHaveAttribute("data-page-count", "2");
    await expect(hiddenIssue).toContainText(`State ${broken!.names[3]} #${broken!.ids[3]}`);
    await expect(hiddenIssue.locator("[data-direct-relationship-preview='true']")).toContainText("#999994 → #0");
    await expect(hiddenIssue.locator("[data-studio-action='direct-relationship-review-field']")).toHaveAttribute("data-edit-id", String(broken!.ids[3]));
    await hiddenPagination.locator("[data-hidden-page='1']").click();
    await expect(hiddenPagination).toHaveAttribute("data-active-page", "1");
    await expect(hiddenPagination.locator("[data-hidden-page='1']")).toHaveClass(/is-active/);
    await expect(hiddenPageOne).toBeHidden();
    await expect(hiddenPageTwo).toBeVisible();
    const hiddenPageTwoScope = hiddenPageTwo.locator("[data-direct-relationship-hidden-page-scope='true']");
    await expect(hiddenPageTwoScope).toHaveAttribute("data-page-start", "6");
    await expect(hiddenPageTwoScope).toHaveAttribute("data-page-end", "6");
    await expect(hiddenPageTwoScope).toHaveAttribute("data-page-count", "1");
    await expect(hiddenPageTwoScope).toHaveAttribute("data-review-target", "States workbench · Culture field");
    await expect(hiddenPageTwoScope).toHaveAttribute("data-recovery-path", "Page recovery path: Queue page → Apply queue → History details → Restore to After / Undo");
    await expect(hiddenPageTwoScope).toContainText("Current page: 6-6 / 6");
    await expect(hiddenPageTwoScope.locator("[data-direct-relationship-hidden-page-review-target='true']")).toContainText("Review target: States workbench · Culture field");
    await expect(hiddenPageTwoScope.locator("[data-studio-action='direct-relationship-review-page']")).toHaveAttribute("data-edit-id", String(broken!.ids[5]));
    await expect(hiddenPageTwo.locator(".studio-direct-workbench-directory__issue")).toContainText(`State ${broken!.names[5]} #${broken!.ids[5]}`);
    await hiddenPageTwoScope.locator("[data-studio-action='direct-relationship-review-page']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);
    await hiddenIssues.locator("summary").click();
    await hiddenPagination.locator("[data-hidden-page='1']").click();
    const queuePanel = issueDetails.locator("[data-direct-relationship-queue='true']");
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeHidden();
    await queuePanel.locator("[data-studio-action='direct-relationship-queue-toggle']").click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeVisible();
    await queuePanel.locator("[data-studio-action='direct-relationship-queue-toggle']").click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeHidden();
    await hiddenPageTwoScope.locator("[data-studio-action='direct-relationship-queue-page']").click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("1");
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeVisible();
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-toggle']")).toHaveText("Collapse");
    await expect(queuePanel.locator("[data-direct-relationship-queue-summary='true']")).toContainText("Impact summary: States culture: 1");
    await expect(queuePanel).toContainText("#999996 → #0");
    await expect(queuePanel).not.toContainText("#999994 → #0");
    await expect(cultureGroup.locator("[data-studio-action='direct-relationship-replace-visible-candidates']")).toHaveAttribute("data-visible-count", "3");
    await expect(cultureGroup.locator("[data-studio-action='direct-relationship-replace-visible-candidates']")).toHaveAttribute("data-hidden-count", "3");
    await expect(cultureGroup.locator("[data-studio-action='direct-relationship-fix-group']")).toHaveAttribute("data-total-count", "6");
    await expect(cultureGroup.locator("[data-studio-action='direct-relationship-queue-group']")).toHaveAttribute("data-total-count", "6");

    const visibleReplacements = await cultureGroup.locator(":scope > .studio-direct-workbench-directory__issue").evaluateAll(issues => issues.map(issue => {
      const button = issue.querySelector<HTMLElement>("[data-studio-action='direct-relationship-replace-reference']");
      return button ? {id: Number(button.dataset.replaceId), value: Number(button.dataset.replaceValue)} : null;
    }).filter((item): item is {id: number; value: number} => Boolean(item)));
    expect(visibleReplacements).toHaveLength(3);
    await cultureGroup.locator("[data-studio-action='direct-relationship-replace-visible-candidates']").click();
    await expect.poll(() => page.evaluate((ids) => {
      const pack = (window as any).pack;
      return ids.map((id: number) => pack.states[id].culture);
    }, broken!.ids)).toEqual([...visibleReplacements.map(({value}) => value), 999994, 999995, 999996]);

    await page.evaluate(({ids}) => {
      const pack = (window as any).pack;
      ids.forEach((id: number, index: number) => {
        pack.states[id].culture = 999991 + index;
      });
    }, broken!);
    await openRepairCenter(page);
    const refreshedGroup = page.locator(".studio-direct-workbench-directory [data-direct-relationship-group='state-clear-culture']").first();
    await refreshedGroup.locator("[data-studio-action='direct-relationship-queue-group']").click();
    const refreshedQueuePanel = page.locator(".studio-direct-workbench-directory [data-direct-relationship-queue='true']").first();
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("6");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-summary='true']")).toContainText("Impact summary: States culture: 6");
  });

  test("cleans broken relationship references from the native workbench directory", async ({page}) => {
    const broken = await page.evaluate(() => {
      const pack = (window as any).pack;
      const states = (pack.states || []).filter((item: any) => item && !item.removed && item.i > 0 && item.name && item.name !== "Neutrals");
      const [state, secondState] = states;
      if (!state || !secondState) return null;
      state.culture = 999999;
      secondState.culture = 999998;
      return {stateId: state.i, stateName: state.name, secondStateId: secondState.i, secondStateName: secondState.name};
    });
    expect(broken).not.toBeNull();
    await openRepairCenter(page);

    const directory = page.locator(".studio-direct-workbench-directory").first();
    const issueDetails = directory.locator("[data-direct-relationship-issues='true']");
    const cultureGroup = issueDetails.locator("[data-direct-relationship-group='state-clear-culture']").first();
    const editButton = cultureGroup.locator("[data-studio-action='direct-relationship-edit-reference']").filter({hasText: "Choose valid culture"}).first();
    const fixButton = cultureGroup.locator("[data-studio-action='direct-relationship-fix']").filter({hasText: "Clear broken culture"}).first();
    const candidateButton = cultureGroup.locator("[data-studio-action='direct-relationship-replace-reference']").first();
    const sourceButton = cultureGroup.locator("[data-studio-action='direct-relationship-select-source']").first();
    const fullPickerButton = cultureGroup.locator("[data-studio-action='direct-relationship-edit-reference']").filter({hasText: "Open full picker"}).first();
    const batchButton = cultureGroup.locator("[data-studio-action='direct-relationship-fix-group']");
    const queueGroupButton = cultureGroup.locator("[data-studio-action='direct-relationship-queue-group']");
    const queuePanel = issueDetails.locator("[data-direct-relationship-queue='true']");
    await expect(directory.locator("[data-direct-relationship-summary='true']")).toContainText("Missing state culture");
    await expect(issueDetails).toContainText("Relationship issue details");
    await expect(cultureGroup).toContainText("Missing state culture");
    await expect(cultureGroup.locator(".studio-direct-workbench-directory__issue-group-main strong")).toHaveText("2");
    await expect(cultureGroup).toContainText("The state references a culture that no longer exists.");
    await expect(cultureGroup).toContainText("Replacement candidates");
    await expect(cultureGroup.locator("[data-direct-relationship-suggestion-hint='true']").first()).toContainText("Prefer replacing with an existing valid entity; clear to #0 only when the reference should stay missing.");
    const candidatePreview = cultureGroup.locator("[data-direct-relationship-candidate-preview='true']").first();
    await expect(candidateButton).toHaveAttribute("data-candidate-rank", "1");
    await expect(candidateButton).toHaveAttribute("data-candidate-recommended", "true");
    await expect(candidateButton.locator("[data-direct-relationship-candidate-badge='true']")).toContainText("Recommended");
    await expect(candidatePreview).toContainText("Culture");
    await expect(candidatePreview).toContainText(/#999999 → .+ #\d+/);
    await expect(candidatePreview.locator("[data-direct-relationship-candidate-reason='true']")).toContainText("#1 · First valid candidate");
    await expect(cultureGroup).toContainText(/Showing \d+ \/ \d+ candidates/);
    await expect(cultureGroup.locator("[data-direct-relationship-preview='true']").first()).toContainText("Repair preview");
    await expect(cultureGroup.locator("[data-direct-relationship-preview='true']").first()).toContainText("#999999 → #0");
    const issueNavigation = cultureGroup.locator("[data-direct-relationship-issue-navigation='true']").first();
    await expect(issueNavigation).toContainText("Navigation path");
    await expect(issueNavigation).toContainText("States workbench · Culture field");
    await expect(issueNavigation).toContainText(`State ${broken!.stateName} #${broken!.stateId} → Culture #999999`);
    await expect(issueNavigation).toHaveAttribute("data-workbench-target", "studioDirectStatesWorkbench");
    await expect(issueNavigation).toHaveAttribute("data-review-field", "culture");
    await expect(issueNavigation.locator("[data-studio-action='direct-relationship-review-field']")).toHaveAttribute("data-edit-id", String(broken!.stateId));
    await expect(cultureGroup.locator("[data-direct-relationship-group-preview='true']")).toContainText("Batch preview");
    await expect(cultureGroup.locator("[data-direct-relationship-group-preview='true']")).toContainText("Missing state culture → #0");
    const batchGuard = cultureGroup.locator("[data-direct-relationship-batch-guard='true']");
    await expect(batchGuard).toHaveAttribute("data-visible-count", "2");
    await expect(batchGuard).toHaveAttribute("data-hidden-count", "0");
    await expect(batchGuard).toContainText("Batch scope");
    await expect(batchGuard).toContainText("Visible: 2 / 2");
    await expect(batchGuard).toContainText("Hidden: 0");
    await expect(batchGuard).toContainText("No hidden issues in this group; batch actions cover the shown scope.");
    await expect(sourceButton).toHaveAttribute("data-source-entity", "state");
    await expect(sourceButton).toHaveAttribute("data-source-id", String(broken!.stateId));
    await expect(fullPickerButton).toHaveAttribute("data-edit-entity", "state");
    await expect(fullPickerButton).toHaveAttribute("data-edit-id", String(broken!.stateId));
    await expect(fullPickerButton).toHaveAttribute("data-edit-field", "culture");
    await expect(batchButton).toHaveAttribute("data-fix-group", "state-clear-culture");
    await expect(batchButton).toHaveAttribute("data-visible-count", "2");
    await expect(batchButton).toHaveAttribute("data-total-count", "2");
    await expect(batchButton).toHaveAttribute("data-hidden-count", "0");
    await expect(queueGroupButton).toHaveAttribute("data-fix-group", "state-clear-culture");
    await expect(queueGroupButton).toHaveAttribute("data-visible-count", "2");
    await expect(queueGroupButton).toHaveAttribute("data-total-count", "2");
    await expect(queueGroupButton).toHaveAttribute("data-hidden-count", "0");
    const replaceVisibleButton = cultureGroup.locator("[data-studio-action='direct-relationship-replace-visible-candidates']");
    await expect(replaceVisibleButton).toHaveAttribute("data-fix-group", "state-clear-culture");
    await expect(replaceVisibleButton).toHaveAttribute("data-visible-count", "2");
    await expect(replaceVisibleButton).toHaveAttribute("data-hidden-count", "0");
    await expect(cultureGroup.locator("[data-direct-relationship-candidate-group-preview='true']")).toContainText("Only replaces the first valid candidate for visible issues");
    await expect(queuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("0");
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeHidden();
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-toggle']")).toHaveText("Details");
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-apply']")).toBeDisabled();
    await expect(editButton).toHaveAttribute("data-edit-entity", "state");
    await expect(editButton).toHaveAttribute("data-edit-id", String(broken!.stateId));
    await expect(editButton).toHaveAttribute("data-edit-field", "culture");
    await expect(candidateButton).toHaveAttribute("data-replace-entity", "state");
    await expect(candidateButton).toHaveAttribute("data-replace-field", "culture");
    await expect(candidateButton).toHaveAttribute("data-replace-id", String(broken!.stateId));
    await expect(candidateButton).toHaveAttribute("data-state-culture", /\d+/);
    await expect(fixButton).toHaveAttribute("data-fix-kind", "state-clear-culture");
    await expect(fixButton).toHaveAttribute("data-state-culture", "0");

    const visibleReplacements = await cultureGroup.locator(".studio-direct-workbench-directory__issue").evaluateAll(issues => issues.map(issue => {
      const button = issue.querySelector<HTMLElement>("[data-studio-action='direct-relationship-replace-reference']");
      return button ? {id: Number(button.dataset.replaceId), value: Number(button.dataset.replaceValue)} : null;
    }).filter((item): item is {id: number; value: number} => Boolean(item)));
    expect(visibleReplacements.length).toBeGreaterThan(0);
    await replaceVisibleButton.click();
    await expect(directory.locator("[data-direct-applied-summary='true']")).toContainText(`States #${visibleReplacements.at(-1)!.id}`);
    await expect.poll(() => page.evaluate((replacements) => {
      const pack = (window as any).pack;
      return replacements.map(({id}: {id: number}) => pack.states[id].culture);
    }, visibleReplacements)).toEqual(visibleReplacements.map(({value}) => value));
    await page.evaluate(({stateId, secondStateId}) => {
      const pack = (window as any).pack;
      pack.states[stateId].culture = 999999;
      pack.states[secondStateId].culture = 999998;
    }, broken!);
    await openRepairCenter(page);

    await cultureGroup.locator("[data-studio-action='direct-relationship-queue-add']").first().click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("1");
    await expect(queuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeVisible();
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-toggle']")).toHaveText("Collapse");
    await expect(queuePanel).toContainText("Missing state culture");
    await expect(queuePanel).toContainText("#999999 → #0");
    await expect(queuePanel.locator("[data-direct-relationship-queue-summary='true']")).toContainText("Impact summary: States culture: 1");
    const queueActionScope = queuePanel.locator("[data-direct-relationship-queue-action-scope='true']");
    await expect(queueActionScope).toHaveAttribute("data-action-state", "queued");
    await expect(queueActionScope).toContainText("Queued Missing state culture");
    await expect(queuePanel.locator("[data-direct-relationship-queue-review='true']")).toContainText("Queue is ready to apply");
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-apply']")).toBeEnabled();
    await page.evaluate((stateId) => {
      (window as any).pack.states[stateId].culture = 999997;
    }, broken!.stateId);
    await queuePanel.locator("[data-studio-action='direct-relationship-queue-apply']").click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-review='true']")).toContainText("Queue needs review");
    await expect(queueActionScope).toHaveAttribute("data-action-state", "conflict");
    await expect(queueActionScope).toContainText("Queue blocked: review duplicate or stale fields before applying · States culture: 1");
    await expect(queuePanel).toContainText("Source changed");
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-apply']")).toBeDisabled();
    await queuePanel.locator("[data-studio-action='direct-relationship-queue-remove']").click();
    await expect(queuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("0");
    await expect(queueActionScope).toHaveAttribute("data-action-state", "idle");
    await expect(queueActionScope).toContainText("Apply writes the whole queue; Review only navigates and does not edit.");
    await expect(queuePanel.locator("[data-studio-action='direct-relationship-queue-apply']")).toBeDisabled();

    await sourceButton.click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await openRepairCenter(page);

    await issueNavigation.locator("[data-studio-action='direct-relationship-review-field']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);

    await fullPickerButton.click();
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);

    const replacementCulture = Number(await candidateButton.getAttribute("data-replace-value"));
    await candidateButton.click();
    await expect(directory.locator("[data-direct-applied-summary='true']")).toContainText(`States #${broken!.stateId}`);
    await expect.poll(() => page.evaluate((stateId) => (window as any).pack.states[stateId].culture, broken!.stateId)).toBe(replacementCulture);
    await expect.poll(() => page.evaluate((secondStateId) => (window as any).pack.states[secondStateId].culture, broken!.secondStateId)).toBe(999998);

    await page.evaluate(({stateId, secondStateId}) => {
      const pack = (window as any).pack;
      pack.states[stateId].culture = 999999;
      pack.states[secondStateId].culture = 999998;
    }, broken!);
    await openRepairCenter(page);

    const refreshedDirectory = page.locator(".studio-direct-workbench-directory").first();
    const refreshedIssueDetails = refreshedDirectory.locator("[data-direct-relationship-issues='true']");
    const refreshedCultureGroup = refreshedIssueDetails.locator("[data-direct-relationship-group='state-clear-culture']").first();
    await refreshedCultureGroup.locator("[data-studio-action='direct-relationship-edit-reference']").filter({hasText: "Choose valid culture"}).first().click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);

    const refreshedQueuePanel = refreshedIssueDetails.locator("[data-direct-relationship-queue='true']");
    await refreshedCultureGroup.locator("[data-studio-action='direct-relationship-queue-group']").click();
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("2");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-details='true']")).toBeVisible();
    await expect(refreshedQueuePanel).toContainText("#999999 → #0");
    await expect(refreshedQueuePanel).toContainText("#999998 → #0");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-summary='true']")).toContainText("Impact summary: States culture: 2");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-action-scope='true']")).toHaveAttribute("data-action-state", "queued");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-action-scope='true']")).toContainText("Queued Missing state culture");
    await refreshedQueuePanel.locator("[data-studio-action='direct-relationship-queue-apply']").click();
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-count='true']")).toHaveText("0");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-action-scope='true']")).toHaveAttribute("data-action-state", "applied");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-action-scope='true']")).toContainText("Applied 2 queued repairs · States culture: 2");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-queue-result='true']")).toContainText("Applied 2 queued repairs · States culture: 2");
    const refreshedQueueHistory = refreshedQueuePanel.locator("[data-direct-relationship-queue-history='true']");
    await expect(refreshedQueueHistory).toContainText("Last queue: 2 repairs · States culture: 2");
    await expect(refreshedQueueHistory).not.toHaveAttribute("open", "");
    await refreshedQueueHistory.locator("summary").click();
    await expect(refreshedQueueHistory).toHaveAttribute("open", "");
    await expect(refreshedQueuePanel.locator("[data-direct-relationship-history-action-scope='true']")).toContainText("Expand to inspect history filters, field audits, and recovery paths.");
    await expect(refreshedDirectory.locator("[data-direct-applied-summary='true']")).toContainText("States #");
    await expect.poll(() => page.evaluate(({stateId, secondStateId}) => {
      const pack = (window as any).pack;
      return [pack.states[stateId].culture, pack.states[secondStateId].culture];
    }, broken!)).toEqual([0, 0]);
    await expect(refreshedDirectory.locator("[data-direct-relationship-summary='true']")).not.toContainText("Missing state culture");
    await openRepairCenter(page);
    const persistedQueuePanel = page.locator(".studio-direct-workbench-directory [data-direct-relationship-queue='true']").first();
    await expect(persistedQueuePanel.locator("[data-direct-relationship-queue-result='true']")).toContainText("Applied 2 queued repairs · States culture: 2");
    const persistedQueueHistory = persistedQueuePanel.locator("[data-direct-relationship-queue-history='true']");
    await expect(persistedQueueHistory).toContainText("Last queue: 2 repairs · States culture: 2");
    await persistedQueueHistory.locator("summary").click();
    await expect(persistedQueueHistory).toHaveAttribute("open", "");
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-detail-item']").first().click();
    const historyAudit = persistedQueuePanel.locator("[data-direct-relationship-history-audit='true']").first();
    await expect(historyAudit).toContainText("Operation: Apply / ready for undo");
    await expect(historyAudit).toContainText("Scope: 2 items · States culture: 2");
    await expect(historyAudit).toContainText("Result: Applied 2 queued repairs · States culture: 2");
    const persistedCurrentReview = persistedQueuePanel.locator("[data-direct-relationship-history-change='true']").first();
    await expect(persistedCurrentReview).toContainText("Current: None #0 · Current matches after");
    await expect(persistedCurrentReview).toContainText("Ready: click Undo last queue.");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current", "0");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current-state", "match");
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-review']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await openRepairCenter(page);
    await persistedQueueHistory.locator("summary").click();
    await expect(persistedQueueHistory).toHaveAttribute("open", "");
    await expect(persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-undo']")).toBeEnabled();
    await page.evaluate(({stateId, secondStateId}) => {
      const pack = (window as any).pack;
      pack.states[stateId].culture = 1;
      pack.states[secondStateId].culture = 2;
    }, broken!);
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-undo']").click();
    await expect(historyAudit).toContainText("Operation: Undo blocked");
    await expect(persistedQueuePanel.locator("[data-direct-relationship-queue-result='true']")).toContainText(`Undo blocked: state #${broken!.stateId} culture changed after apply`);
    await expect(persistedQueueHistory).toContainText("Last queue: 2 repairs · States culture: 2 · undo blocked");
    if (!await persistedQueueHistory.evaluate(element => (element as HTMLDetailsElement).open)) {
      await persistedQueueHistory.locator("summary").click();
    }
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-detail-item']").first().click();
    const recoveryPath = persistedQueuePanel.locator("[data-direct-relationship-history-recovery='true']").first();
    await expect(recoveryPath).toContainText("Next: Review field → Restore to After → Undo");
    await expect(recoveryPath).toHaveAttribute("data-recovery-scope", "Recovery scope: 2 items · States culture: 2 · Only the latest queue is recoverable; older history is read-only.");
    await expect(recoveryPath.locator("[data-direct-relationship-history-recovery-scope='true']")).toContainText("Recovery scope: 2 items · States culture: 2 · Only the latest queue is recoverable; older history is read-only.");
    const staleReviews = persistedQueuePanel.locator("[data-direct-relationship-history-change='true'][data-history-current-state='stale']");
    await expect(staleReviews).toHaveCount(2);
    await expect(persistedCurrentReview).toContainText("Current:");
    await expect(persistedCurrentReview).toContainText("#1 · Current changed");
    await expect(persistedCurrentReview).toContainText("Restore to After first (None #0), then undo.");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current", "1");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current-state", "stale");
    await expect(persistedCurrentReview.locator("[data-direct-relationship-history-field-audit='true']")).toContainText(/Current .+ #1 · Current differs from After, restore first/);
    const restoreAfterButton = persistedCurrentReview.locator("[data-studio-action='direct-relationship-history-restore-after']");
    await expect(restoreAfterButton).toBeVisible();
    const restoreAllAfterButton = recoveryPath.locator("[data-studio-action='direct-relationship-history-restore-all-after']");
    await expect(restoreAllAfterButton).toBeVisible();
    await restoreAllAfterButton.click();
    await expect(historyAudit).toContainText("Result: Restored 2 fields to After · States culture: 2");
    await expect(persistedQueuePanel.locator("[data-direct-relationship-queue-result='true']")).toContainText("Restored 2 fields to After · States culture: 2");
    await expect(persistedCurrentReview).toContainText("Current: None #0 · Current matches after");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current", "0");
    await expect(persistedCurrentReview).toHaveAttribute("data-history-current-state", "match");
    await expect(persistedCurrentReview.locator("[data-direct-relationship-history-field-audit='true']")).toContainText("Current matches After, ready to undo");
    await expect(staleReviews).toHaveCount(0);
    await expect(recoveryPath).toContainText("Restored to After: undo is ready. Next, click Undo last queue.");
    await expect(recoveryPath).toHaveAttribute("data-recovery-state", "ready");
    await expect(recoveryPath).toHaveAttribute("data-recovery-scope", "Recovery scope: 2 items · States culture: 2 · Only the latest queue is recoverable; older history is read-only.");
    await expect(restoreAfterButton).toBeHidden();
    await expect(restoreAllAfterButton).toBeHidden();
    if (!await persistedQueueHistory.evaluate(element => (element as HTMLDetailsElement).open)) {
      await persistedQueueHistory.locator("summary").click();
    }
    await expect(persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-undo']")).toBeEnabled();
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-undo']").click();
    await persistedQueueHistory.locator("summary").click();
    await persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-detail-item']").first().click();
    const undoneHistoryAudit = persistedQueuePanel.locator("[data-direct-relationship-history-audit='true']").first();
    await expect(undoneHistoryAudit).toContainText("Operation: Undo completed");
    await expect(undoneHistoryAudit).toContainText("Result: Undid 2 queued repairs · States culture: 2");
    await expect(persistedQueuePanel.locator("[data-direct-relationship-queue-result='true']")).toContainText("Undid 2 queued repairs · States culture: 2");
    await expect(persistedQueuePanel.locator("[data-direct-relationship-queue-history='true']")).toContainText("Last queue: 2 repairs · States culture: 2 · undone");
    await expect(persistedQueuePanel.locator("[data-studio-action='direct-relationship-history-undo']")).toBeDisabled();
    await expect.poll(() => page.evaluate(({stateId, secondStateId}) => {
      const pack = (window as any).pack;
      return [pack.states[stateId].culture, pack.states[secondStateId].culture];
    }, broken!)).toEqual([999999, 999998]);

    await openRepairCenter(page);
    const secondIssueDetails = page.locator(".studio-direct-workbench-directory [data-direct-relationship-issues='true']").first();
    const secondCultureGroup = secondIssueDetails.locator("[data-direct-relationship-group='state-clear-culture']").first();
    const secondQueuePanel = secondIssueDetails.locator("[data-direct-relationship-queue='true']");
    await secondCultureGroup.locator("[data-studio-action='direct-relationship-queue-group']").click();
    await secondQueuePanel.locator("[data-studio-action='direct-relationship-queue-apply']").click();
    const secondQueueHistory = secondQueuePanel.locator("[data-direct-relationship-queue-history='true']");
    await secondQueueHistory.locator("summary").click();
    await expect(secondQueueHistory).toHaveAttribute("open", "");
    const historyRows = secondQueuePanel.locator("[data-direct-relationship-history-row='true']");
    const historyFilters = secondQueuePanel.locator("[data-direct-relationship-history-filters='true']");
    await expect(historyRows).toHaveCount(2);
    const historyFilterSummary = secondQueuePanel.locator("[data-direct-relationship-history-filter-summary='true']");
    const historyFilterEmpty = secondQueuePanel.locator("[data-direct-relationship-history-filter-empty='true']");
    await expect(historyFilters).toHaveAttribute("data-history-filter", "all");
    await expect(historyFilters).toHaveAttribute("data-history-visible", "2");
    await expect(historyFilters).toHaveAttribute("data-history-total", "2");
    await expect(historyFilterSummary).toContainText("Current filter: All · Visible: 2 / 2");
    await expect(historyFilterEmpty).toBeHidden();
    await expect(historyFilters.locator("[data-history-filter='all'] strong")).toHaveText("2");
    await expect(historyFilters.locator("[data-history-filter='blocked'] strong")).toHaveText("0");
    await expect(historyFilters.locator("[data-history-filter='undoable'] strong")).toHaveText("1");
    await expect(historyFilters.locator("[data-history-filter='undone'] strong")).toHaveText("1");
    await expect(historyFilters.locator("[data-history-filter='readonly'] strong")).toHaveText("0");
    await expect(historyRows.nth(0)).toHaveAttribute("data-history-row-status", "undoable");
    await expect(historyRows.nth(1)).toHaveAttribute("data-history-row-status", "undone");
    await historyFilters.locator("[data-studio-action='direct-relationship-history-filter'][data-history-filter='undone']").click();
    await expect(historyFilters).toHaveAttribute("data-history-filter", "undone");
    await expect(historyFilters).toHaveAttribute("data-history-visible", "1");
    await expect(historyFilters.locator("[data-history-filter='undone']")).toHaveClass(/is-active/);
    await expect(historyFilterSummary).toContainText("Current filter: Undone · Visible: 1 / 2");
    await expect(historyRows.nth(0)).toBeHidden();
    await expect(historyRows.nth(1)).toBeVisible();
    await historyFilters.locator("[data-studio-action='direct-relationship-history-filter'][data-history-filter='undoable']").click();
    await expect(historyFilters).toHaveAttribute("data-history-visible", "1");
    await expect(historyFilterSummary).toContainText("Current filter: Undoable · Visible: 1 / 2");
    await expect(historyRows.nth(0)).toBeVisible();
    await expect(historyRows.nth(1)).toBeHidden();
    await historyFilters.locator("[data-studio-action='direct-relationship-history-filter'][data-history-filter='readonly']").click();
    await expect(historyFilters).toHaveAttribute("data-history-visible", "0");
    await expect(historyFilterSummary).toContainText("Current filter: Read-only · Visible: 0 / 2");
    await expect(historyFilterEmpty).toBeVisible();
    await expect(historyFilterEmpty).toContainText("No history items match the current filter.");
    await historyFilters.locator("[data-studio-action='direct-relationship-history-filter'][data-history-filter='blocked']").click();
    await expect(historyFilters).toHaveAttribute("data-history-visible", "0");
    await expect(historyFilterSummary).toContainText("Current filter: Blocked · Visible: 0 / 2");
    await expect(historyRows.nth(0)).toBeHidden();
    await expect(historyRows.nth(1)).toBeHidden();
    await expect(historyFilterEmpty).toBeVisible();
    await historyFilters.locator("[data-studio-action='direct-relationship-history-filter'][data-history-filter='all']").click();
    await expect(historyFilters).toHaveAttribute("data-history-visible", "2");
    await expect(historyFilterSummary).toContainText("Current filter: All · Visible: 2 / 2");
    await expect(historyFilterEmpty).toBeHidden();
    await expect(historyRows.nth(0)).toBeVisible();
    await expect(historyRows.nth(1)).toBeVisible();
    await expect(historyRows.nth(0)).toContainText("Latest · 2 repairs · States culture: 2");
    await expect(historyRows.nth(0)).toContainText("Undoable");
    await expect(historyRows.nth(0)).toHaveAttribute("data-history-first-target", "States workbench · Culture field");
    await expect(historyRows.nth(0)).toHaveAttribute("data-history-first-change", `State · ${broken!.stateName} #${broken!.stateId} · Culture`);
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-row-target='true']")).toContainText("First locator: States workbench · Culture field");
    await expect(historyRows.nth(0).locator("[data-studio-action='direct-relationship-history-review-item']")).toContainText("Review first");
    await historyRows.nth(0).locator("[data-studio-action='direct-relationship-history-detail-item']").click();
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-detail='true']")).toBeVisible();
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-detail='true']")).toHaveClass(/is-compact/);
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-detail='true']")).toHaveAttribute("data-direct-relationship-history-mobile-wrap", "true");
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-detail='true']")).toContainText("Undoable: this is the latest queue.");
    const latestBatchSummary = historyRows.nth(0).locator("[data-direct-relationship-history-batch='true']");
    await expect(latestBatchSummary).toContainText("Batch review: 2 changes · Entities: State · Fields: Culture");
    await expect(historyRows.nth(0).locator("[data-direct-relationship-history-change='true']")).toHaveCount(2);
    const latestHistoryChange = historyRows.nth(0).locator("[data-direct-relationship-history-change='true']").first();
    await expect(latestHistoryChange).toContainText(`State · ${broken!.stateName} #${broken!.stateId}`);
    await expect(latestHistoryChange).toContainText("Culture");
    await expect(latestHistoryChange).toContainText("Before: Missing reference #999999");
    await expect(latestHistoryChange).toContainText("After: None #0");
    await expect(latestHistoryChange).toHaveAttribute("data-history-field-audit", `Field audit: State · ${broken!.stateName} #${broken!.stateId} · Culture · Before Missing reference #999999 → After None #0 · Current None #0 · Current matches After, ready to undo`);
    await expect(latestHistoryChange.locator("[data-direct-relationship-history-field-audit='true']")).toContainText(`Field audit: State · ${broken!.stateName} #${broken!.stateId} · Culture · Before Missing reference #999999 → After None #0 · Current None #0 · Current matches After, ready to undo`);
    await expect(latestHistoryChange.locator("[data-direct-relationship-history-target='true']")).toContainText("Review target: States workbench · Culture field");
    await expect(latestHistoryChange.locator("[data-studio-action='direct-relationship-history-review-field']")).toContainText("Review field");
    await expect(latestHistoryChange).toHaveAttribute("data-history-before", "999999");
    await expect(latestHistoryChange).toHaveAttribute("data-history-after", "0");
    await latestHistoryChange.locator("[data-studio-action='direct-relationship-history-review-field']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);
    const postFieldReviewQueueHistory = page.locator(".studio-direct-workbench-directory [data-direct-relationship-queue-history='true']").first();
    await postFieldReviewQueueHistory.locator("summary").click();
    const postFieldReviewHistoryRows = postFieldReviewQueueHistory.locator("[data-direct-relationship-history-row='true']");
    await postFieldReviewHistoryRows.nth(0).locator("[data-studio-action='direct-relationship-history-detail-item']").click();
    await expect(postFieldReviewHistoryRows.nth(1)).toContainText("History · 2 repairs · States culture: 2 · undone");
    await expect(postFieldReviewHistoryRows.nth(1)).toContainText("Undone");
    await expect(postFieldReviewHistoryRows.nth(1)).toHaveAttribute("data-history-first-target", "States workbench · Culture field");
    await expect(postFieldReviewHistoryRows.nth(1).locator("[data-direct-relationship-history-row-target='true']")).toContainText("First locator: States workbench · Culture field");
    await postFieldReviewHistoryRows.nth(1).locator("[data-studio-action='direct-relationship-history-detail-item']").click();
    await expect(postFieldReviewHistoryRows.nth(1).locator("[data-direct-relationship-history-detail='true']")).toBeVisible();
    await expect(postFieldReviewHistoryRows.nth(1).locator("[data-direct-relationship-history-detail='true']")).toContainText("Undone: this queue was restored.");
    await expect(postFieldReviewHistoryRows.nth(0).locator("[data-direct-relationship-history-detail='true']")).toBeHidden();
    await openRepairCenter(page);
    const reviewQueueHistory = page.locator(".studio-direct-workbench-directory [data-direct-relationship-queue-history='true']").first();
    await reviewQueueHistory.locator("summary").click();
    const reviewHistoryRows = reviewQueueHistory.locator("[data-direct-relationship-history-row='true']");
    await reviewHistoryRows.nth(0).locator("[data-studio-action='direct-relationship-history-review-item']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioStateCultureInput")).toBeFocused();
    await openRepairCenter(page);
    const secondReviewQueueHistory = page.locator(".studio-direct-workbench-directory [data-direct-relationship-queue-history='true']").first();
    await secondReviewQueueHistory.locator("summary").click();
    await secondReviewQueueHistory.locator("[data-direct-relationship-history-row='true']").nth(1).locator("[data-studio-action='direct-relationship-history-review-item']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
  });

  test("shows the native AGM states workbench and focuses a state on the map", async ({page}) => {
    const editorsNav = sectionNav(page, "editors");
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");

    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-editor").first();
    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(workbench).toContainText("AGM editor");
    await expect(workbench).toContainText("States Workbench");
    await expect(workbench.locator(".studio-state-row").first()).toBeVisible();

    await workbench.locator("[data-studio-action='balance-focus'][data-target-type='state']").first().click();

    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "state");
  });

  test("edits the selected state in the native AGM states workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-editor").first();
    const secondState = workbench.locator("[data-studio-action='direct-state-select']").nth(1);
    const stateId = Number(await secondState.getAttribute("data-state-id"));
    expect(stateId).toBeGreaterThan(0);

    await secondState.click();
    await expect(secondState).toHaveClass(/is-active/);

    const nextName = `AGM Test State ${stateId}`;
    const nextFormName = "Test Dominion";
    const nextFullName = `${nextName} Dominion`;

    await page.locator("#studioStateNameInput").fill(nextName);
    await page.locator("#studioStateFormInput").fill("Grand Duchy");
    await page.locator("#studioStateFormNameInput").fill(nextFormName);
    await page.locator("#studioStateFullNameInput").fill(nextFullName);
    await page.locator("#studioStateColorInput").fill("#3366aa");
    await page.locator("#studioStateCultureInput").fill("8");
    await page.locator("#studioStateCapitalInput").fill("12");
    await page.locator("#studioStatePopulationInput").fill("123456");
    await page.locator("#studioStateRuralInput").fill("100000");
    await page.locator("#studioStateUrbanInput").fill("23456");
    await workbench.locator("[data-studio-action='direct-state-apply']").click();

    await expect(workbench.locator(".studio-state-row.is-active")).toContainText(nextName);
    await expect(page.locator("#studioStateFullNameInput")).toHaveValue(nextFullName);
    await expect.poll(async () =>
      page.evaluate(id => {
        const state = (window as any).pack.states[id];
        return {name: state.name, form: state.form, formName: state.formName, fullName: state.fullName, color: state.color, culture: state.culture, capital: state.capital, population: state.population, rural: state.rural, urban: state.urban};
      }, stateId),
    ).toEqual({name: nextName, form: "Grand Duchy", formName: nextFormName, fullName: nextFullName, color: "#3366aa", culture: 8, capital: 12, population: 123456, rural: 100000, urban: 23456});

    const directory = page.locator(".studio-direct-workbench-directory").first();
    await expect(directory.locator("[data-direct-applied-summary='true']")).toContainText(`States #${stateId}`);
    const reviewApplied = directory.locator("[data-studio-action='direct-workbench-review-applied']");
    await expect(reviewApplied).toBeEnabled();
    await expect(reviewApplied).toHaveAttribute("data-workbench-target", "studioDirectStatesWorkbench");
    await reviewApplied.click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
  });

  test("updates state culture and capital through searchable native pickers", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-editor").first();
    const secondState = workbench.locator("[data-studio-action='direct-state-select']").nth(1);
    const stateId = Number(await secondState.getAttribute("data-state-id"));
    expect(stateId).toBeGreaterThan(0);

    await secondState.click();

    const pickerTargets = await page.evaluate(id => {
      const cultures = ((window as any).pack.cultures || []).filter((culture: any) => culture && !culture.removed && culture.i > 0 && culture.name);
      const burgs = ((window as any).pack.burgs || []).filter((burg: any) => burg && !burg.removed && burg.i > 0 && burg.name);
      const culture = cultures.find((item: any) => item.i !== (window as any).pack.states[id].culture) || cultures[0];
      const capital = burgs.find((item: any) => item.state === id && item.i !== (window as any).pack.states[id].capital) || burgs.find((item: any) => item.i !== (window as any).pack.states[id].capital) || burgs[0];
      return {
        cultureId: culture.i,
        cultureValue: `${culture.name} #${culture.i}`,
        capitalId: capital.i,
        capitalValue: `${capital.name} #${capital.i}`,
      };
    }, stateId);

    await page.locator("#studioStateCultureInput").fill(pickerTargets.cultureValue);
    await page.locator("#studioStateCapitalInput").fill(pickerTargets.capitalValue);
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-state-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const state = (window as any).pack.states[id];
        return {culture: state.culture, capital: state.capital};
      }, stateId),
    ).toEqual({culture: pickerTargets.cultureId, capital: pickerTargets.capitalId});
  });

  test("updates state relationship fields in the native AGM states workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-editor").first();
    const secondState = workbench.locator("[data-studio-action='direct-state-select']").nth(1);
    const stateId = Number(await secondState.getAttribute("data-state-id"));
    expect(stateId).toBeGreaterThan(0);

    await secondState.click();

    await page.locator("#studioStateNeighborsInput").fill("1, 3 5; 3");
    await page.locator("#studioStateDiplomacyInput").fill("Ally\nRival\nTrade pact");
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-state-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const state = (window as any).pack.states[id];
        return {neighbors: state.neighbors, diplomacy: state.diplomacy};
      }, stateId),
    ).toEqual({neighbors: [1, 3, 5], diplomacy: ["Ally", "Rival", "Trade pact"]});
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Applied");
  });

  test("filters and sorts states in the native AGM states workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-editor").first();
    const firstStateName = await workbench.locator(".studio-state-row__main strong").first().innerText();
    const secondStateName = await workbench.locator(".studio-state-row__main strong").nth(1).innerText();

    await page.locator("#studioStateSearchInput").fill(secondStateName);
    await expect(workbench.locator(".studio-state-row")).toHaveCount(1);
    await expect(workbench.locator(".studio-state-row").first()).toContainText(secondStateName);
    await expect(workbench).toContainText("Current list");
    await expect(workbench).toContainText("1");

    await page.locator("#studioStateSearchInput").fill("");
    await page.locator("#studioStateSortSelect").selectOption("population");
    const populations = await workbench.locator(".studio-state-row__metric").evaluateAll(items =>
      items.slice(0, 4).map(item => {
        const value = item.textContent || "";
        if (value.endsWith("M")) return Number(value.slice(0, -1)) * 1_000_000;
        if (value.endsWith("K")) return Number(value.slice(0, -1)) * 1_000;
        if (value === "—") return 0;
        return Number(value);
      }),
    );
    expect(populations).toEqual([...populations].sort((left, right) => right - left));

    await page.locator("#studioStateFilterSelect").selectOption("neighbors");
    await expect(workbench.locator(".studio-state-row").first()).toBeVisible();
    await page.locator("#studioStateSearchInput").fill(firstStateName);
    await expect(page.locator("#studioStateSearchInput")).toHaveValue(firstStateName);
  });

  test("highlights selected states on the map and tracks dirty state edits", async ({page}) => {
    await openEditorsWorkspace(page);

    const editorsNav = sectionNav(page, "editors");
    const workbench = page.locator(".studio-direct-editor").first();
    const secondState = workbench.locator("[data-studio-action='direct-state-select']").nth(1);
    const stateId = Number(await secondState.getAttribute("data-state-id"));
    expect(stateId).toBeGreaterThan(0);

    await secondState.click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "state");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(stateId));

    const nextName = `Dirty State ${stateId}`;
    await page.locator("#studioStateNameInput").fill(nextName);
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Unsaved changes");
    await expect(page.locator("#studioStateEditStatus")).toHaveAttribute("data-status", "dirty");

    await workbench.locator("[data-studio-action='direct-state-apply']").click();
    await expect.poll(async () => page.evaluate(id => (window as any).pack.states[id].name, stateId)).toBe(nextName);
    await expect(workbench.locator(".studio-state-row.is-active")).toContainText(nextName);
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Applied");
    await expect(page.locator("#studioStateEditStatus")).toHaveAttribute("data-status", "saved");

    await page.locator("#studioStateFullNameInput").fill(`${nextName} Reset Draft`);
    await expect(page.locator("#studioStateEditStatus")).toHaveText("Unsaved changes");
    await workbench.locator("[data-studio-action='direct-state-reset']").click();
    await expect(page.locator("#studioStateEditStatus")).toHaveText("No changes");
    await expect(page.locator("#studioStateEditStatus")).toHaveAttribute("data-status", "clean");
    await expect(page.locator("#studioStateFullNameInput")).not.toHaveValue(`${nextName} Reset Draft`);
  });

  test("edits burgs in the native AGM burgs workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-burg-editor").first();
    await expect(workbench).toContainText("Burgs Workbench");
    await expect(workbench.locator("[data-studio-action='direct-burg-select']").first()).toBeVisible();

    const firstBurgName = await workbench.locator("[data-studio-action='direct-burg-select'] .studio-state-row__main strong").first().innerText();
    await page.locator("#studioBurgSearchInput").fill(firstBurgName);
    await expect(workbench.locator("[data-studio-action='direct-burg-select']").first()).toContainText(firstBurgName);

    const firstBurg = workbench.locator("[data-studio-action='direct-burg-select']").first();
    const burgId = Number(await firstBurg.getAttribute("data-burg-id"));
    expect(burgId).toBeGreaterThan(0);
    await firstBurg.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "burg");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(burgId));

    const pickerTargets = await page.evaluate(() => {
      const states = ((window as any).pack.states || []).filter((state: any) => state && !state.removed && state.i > 0 && state.name && state.name !== "Neutrals");
      const cultures = ((window as any).pack.cultures || []).filter((culture: any) => culture && !culture.removed && culture.i > 0 && culture.name);
      return {
        stateId: states[0].i,
        stateValue: `${states[0].name} #${states[0].i}`,
        cultureId: cultures[0].i,
        cultureValue: `${cultures[0].name} #${cultures[0].i}`,
      };
    });

    const nextName = `AGM Burg ${burgId}`;
    await page.locator("#studioBurgNameInput").fill(nextName);
    await page.locator("#studioBurgTypeInput").fill("Harbor");
    await page.locator("#studioBurgStateInput").fill(pickerTargets.stateValue);
    await page.locator("#studioBurgCultureInput").fill(pickerTargets.cultureValue);
    await page.locator("#studioBurgPopulationInput").fill("34567");
    await expect(page.locator("#studioBurgEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-burg-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const burg = (window as any).pack.burgs[id];
        return {name: burg.name, type: burg.type, state: burg.state, culture: burg.culture, population: burg.population};
      }, burgId),
    ).toEqual({name: nextName, type: "Harbor", state: pickerTargets.stateId, culture: pickerTargets.cultureId, population: 34567});
    await expect(page.locator("#studioBurgEditStatus")).toHaveText("Applied");

    await workbench.locator("[data-studio-action='direct-state-open']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectStatesWorkbench .studio-state-row.is-active")).toHaveAttribute("data-state-id", String(pickerTargets.stateId));

    await workbench.locator("[data-studio-action='direct-culture-open']").click();
    await expect(page.locator("#studioDirectCulturesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectCulturesWorkbench .studio-state-row.is-active")).toHaveAttribute("data-culture-id", String(pickerTargets.cultureId));
  });

  test("edits cultures in the native AGM cultures workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-culture-editor").first();
    await expect(workbench).toContainText("Cultures Workbench");
    await expect(workbench.locator("[data-studio-action='direct-culture-select']").first()).toBeVisible();

    const firstCulture = workbench.locator("[data-studio-action='direct-culture-select']").first();
    const cultureId = Number(await firstCulture.getAttribute("data-culture-id"));
    expect(cultureId).toBeGreaterThan(0);
    await firstCulture.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "culture");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(cultureId));

    const nextName = `AGM Culture ${cultureId}`;
    await page.locator("#studioCultureNameInput").fill(nextName);
    await page.locator("#studioCultureTypeInput").fill("Clade");
    await page.locator("#studioCultureColorInput").fill("#aa8844");
    await expect(page.locator("#studioCultureEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-culture-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const culture = (window as any).pack.cultures[id];
        return {name: culture.name, form: culture.form, formName: culture.formName, type: culture.type, color: culture.color};
      }, cultureId),
    ).toEqual({name: nextName, form: "Clade", formName: "Clade", type: "Clade", color: "#aa8844"});
    await expect(page.locator("#studioCultureEditStatus")).toHaveText("Applied");

    await page.locator("#studioCultureSearchInput").fill(nextName);
    await expect(workbench.locator("[data-studio-action='direct-culture-select']").first()).toContainText(nextName);
  });

  test("edits religions in the native AGM religions workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-religion-editor").first();
    await expect(workbench).toContainText("Religions Workbench");
    await expect(workbench.locator("[data-studio-action='direct-religion-select']").first()).toBeVisible();

    const firstReligion = workbench.locator("[data-studio-action='direct-religion-select']").first();
    const religionId = Number(await firstReligion.getAttribute("data-religion-id"));
    expect(religionId).toBeGreaterThan(0);
    await firstReligion.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "religion");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(religionId));

    const nextName = `AGM Religion ${religionId}`;
    await page.locator("#studioReligionNameInput").fill(nextName);
    await page.locator("#studioReligionTypeInput").fill("Order");
    await page.locator("#studioReligionColorInput").fill("#8866cc");
    await expect(page.locator("#studioReligionEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-religion-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const religion = (window as any).pack.religions[id];
        return {name: religion.name, form: religion.form, formName: religion.formName, type: religion.type, color: religion.color};
      }, religionId),
    ).toEqual({name: nextName, form: "Order", formName: "Order", type: "Order", color: "#8866cc"});
    await expect(page.locator("#studioReligionEditStatus")).toHaveText("Applied");

    await page.locator("#studioReligionSearchInput").fill(nextName);
    await expect(workbench.locator("[data-studio-action='direct-religion-select']").first()).toContainText(nextName);
  });

  test("edits provinces in the native AGM provinces workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-province-editor").first();
    await expect(workbench).toContainText("Provinces Workbench");
    await expect(workbench.locator("[data-studio-action='direct-province-select']").first()).toBeVisible();

    const firstProvinceName = await workbench.locator("[data-studio-action='direct-province-select'] .studio-state-row__main strong").first().innerText();
    await page.locator("#studioProvinceSearchInput").fill(firstProvinceName);
    await expect(workbench.locator("[data-studio-action='direct-province-select']").first()).toContainText(firstProvinceName);

    const firstProvince = workbench.locator("[data-studio-action='direct-province-select']").first();
    const provinceId = Number(await firstProvince.getAttribute("data-province-id"));
    expect(provinceId).toBeGreaterThan(0);
    await firstProvince.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "province");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(provinceId));

    const pickerTargets = await page.evaluate(() => {
      const states = ((window as any).pack.states || []).filter((state: any) => state && !state.removed && state.i > 0 && state.name && state.name !== "Neutrals");
      const burgs = ((window as any).pack.burgs || []).filter((burg: any) => burg && !burg.removed && burg.i > 0 && burg.name);
      return {
        stateId: states[0].i,
        stateValue: `${states[0].name} #${states[0].i}`,
        burgId: burgs[0].i,
        burgValue: `${burgs[0].name} #${burgs[0].i}`,
      };
    });

    const nextName = `AGM Province ${provinceId}`;
    const nextFullName = `${nextName} Full`;
    await page.locator("#studioProvinceNameInput").fill(nextName);
    await page.locator("#studioProvinceFullNameInput").fill(nextFullName);
    await page.locator("#studioProvinceTypeInput").fill("March");
    await page.locator("#studioProvinceStateInput").fill(pickerTargets.stateValue);
    await page.locator("#studioProvinceBurgInput").fill(pickerTargets.burgValue);
    await page.locator("#studioProvinceColorInput").fill("#336699");
    await expect(page.locator("#studioProvinceEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-province-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const province = (window as any).pack.provinces[id];
        return {name: province.name, fullName: province.fullName, formName: province.formName, type: province.type, state: province.state, burg: province.burg, color: province.color};
      }, provinceId),
    ).toEqual({name: nextName, fullName: nextFullName, formName: "March", type: "March", state: pickerTargets.stateId, burg: pickerTargets.burgId, color: "#336699"});
    await expect(page.locator("#studioProvinceEditStatus")).toHaveText("Applied");

    await workbench.locator("[data-studio-action='direct-state-open']").click();
    await expect(page.locator("#studioDirectStatesWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectStatesWorkbench .studio-state-row.is-active")).toHaveAttribute("data-state-id", String(pickerTargets.stateId));

    await workbench.locator("[data-studio-action='direct-burg-select']").click();
    await expect(page.locator("#studioDirectBurgsWorkbench")).toHaveClass(/is-jump-highlight/);
    await expect(page.locator("#studioDirectBurgsWorkbench .studio-state-row.is-active")).toHaveAttribute("data-burg-id", String(pickerTargets.burgId));
  });

  test("edits routes in the native AGM routes workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-route-editor").first();
    await expect(workbench).toContainText("Routes Workbench");
    await expect(workbench.locator("[data-studio-action='direct-route-select']").first()).toBeVisible();

    const firstRoute = workbench.locator("[data-studio-action='direct-route-select']").first();
    const routeId = Number(await firstRoute.getAttribute("data-route-id"));
    expect(routeId).toBeGreaterThan(0);
    await firstRoute.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "route");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(routeId));

    const nextGroup = `AGM Route ${routeId}`;
    await page.locator("#studioRouteGroupInput").fill(nextGroup);
    await page.locator("#studioRouteFeatureInput").fill("7");
    await expect(page.locator("#studioRouteEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-route-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const route = (window as any).pack.routes[id];
        return {group: route.group, feature: route.feature};
      }, routeId),
    ).toEqual({group: nextGroup, feature: 7});
    await expect(page.locator("#studioRouteEditStatus")).toHaveText("Applied");

    await page.locator("#studioRouteSearchInput").fill(nextGroup);
    await expect(workbench.locator("[data-studio-action='direct-route-select']").first()).toContainText(nextGroup);
  });

  test("edits zones in the native AGM zones workbench", async ({page}) => {
    await page.evaluate(() => {
      const pack = (window as any).pack;
      if (!pack.zones.length) {
        const cells = (Array.from(pack.cells.i || []) as number[]).filter(cellId => pack.cells.h[cellId] >= 20).slice(0, 16);
        pack.zones.push({i: 0, name: "AGM Seed Zone", type: "Test", color: "#aa6633", cells});
      }
    });
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-zone-editor").first();
    await expect(workbench).toContainText("Zones Workbench");
    await expect(workbench.locator("[data-studio-action='direct-zone-select']").first()).toBeVisible();

    const firstZone = workbench.locator("[data-studio-action='direct-zone-select']").first();
    const zoneId = Number(await firstZone.getAttribute("data-zone-id"));
    expect(zoneId).toBeGreaterThanOrEqual(0);
    await firstZone.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "zone");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(zoneId));

    const nextName = `AGM Zone ${zoneId}`;
    await page.locator("#studioZoneNameInput").fill(nextName);
    await page.locator("#studioZoneTypeInput").fill("Strategic");
    await page.locator("#studioZoneColorInput").fill("#cc7722");
    await page.locator("#studioZoneHiddenSelect").selectOption("true");
    await expect(page.locator("#studioZoneEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-zone-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => {
        const zone = (window as any).pack.zones.find((item: any) => item.i === id);
        return {name: zone.name, type: zone.type, color: zone.color, hidden: zone.hidden};
      }, zoneId),
    ).toEqual({name: nextName, type: "Strategic", color: "#cc7722", hidden: true});
    await expect(page.locator("#studioZoneEditStatus")).toHaveText("Applied");

    await page.locator("#studioZoneSearchInput").fill(nextName);
    await expect(workbench.locator("[data-studio-action='direct-zone-select']").first()).toContainText(nextName);
  });

  test("edits diplomacy relations in the native AGM diplomacy workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-diplomacy-editor").first();
    await expect(workbench).toContainText("Diplomacy Workbench");
    await expect(workbench.locator("[data-studio-action='direct-diplomacy-object-select']").first()).toBeVisible();

    const ids = await page.evaluate(() => {
      const states = ((window as any).pack.states || []).filter((state: any) => state && !state.removed && state.i > 0 && state.name && state.name !== "Neutrals");
      return {subjectId: states[0].i, objectId: states[1].i};
    });

    await page.locator("#studioDiplomacySubjectSelect").selectOption(String(ids.subjectId));
    await workbench.locator(`[data-studio-action='direct-diplomacy-object-select'][data-state-id='${ids.objectId}']`).click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "state");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(ids.objectId));

    await page.locator("#studioDiplomacyRelationSelect").selectOption("Vassal");
    await expect(page.locator("#studioDiplomacyEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-diplomacy-apply']").click();

    await expect.poll(async () =>
      page.evaluate(({subjectId, objectId}) => {
        const states = (window as any).pack.states;
        return {
          subjectRelation: states[subjectId].diplomacy[objectId],
          objectRelation: states[objectId].diplomacy[subjectId],
        };
      }, ids),
    ).toEqual({subjectRelation: "Vassal", objectRelation: "Suzerain"});
    await expect(page.locator("#studioDiplomacyEditStatus")).toHaveText("Applied");

    await page.locator("#studioDiplomacySearchInput").fill("Vassal");
    await expect(workbench.locator("[data-studio-action='direct-diplomacy-object-select']").first()).toContainText("Vassal");
  });

  test("edits biomes and resource rules in the native AGM biomes workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const workbench = page.locator(".studio-direct-biome-editor").first();
    await expect(workbench).toContainText("Biomes / Resources Workbench");
    await expect(workbench.locator("[data-studio-action='direct-biome-select']").first()).toBeVisible();

    const firstBiome = workbench.locator("[data-studio-action='direct-biome-select']").first();
    const biomeId = Number(await firstBiome.getAttribute("data-biome-id"));
    expect(biomeId).toBeGreaterThanOrEqual(0);
    await firstBiome.click();

    await expect(page.locator("#studioBalanceFocusOverlay")).toBeVisible();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "biome");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(biomeId));

    await page.locator("#studioBiomeHabitabilityInput").fill("72");
    await page.locator("#studioBiomeRuleWeightInput").fill("1.7");
    await page.locator("#studioBiomeResourceTagSelect").selectOption("timber");
    await expect(page.locator("#studioBiomeEditStatus")).toHaveText("Unsaved changes");

    await workbench.locator("[data-studio-action='direct-biome-apply']").click();

    await expect.poll(async () =>
      page.evaluate(id => ({
        habitability: (window as any).biomesData.habitability[id],
        agmRuleWeight: (window as any).biomesData.agmRuleWeight[id],
        agmResourceTag: (window as any).biomesData.agmResourceTag[id],
      }), biomeId),
    ).toEqual({habitability: 72, agmRuleWeight: 1.7, agmResourceTag: "timber"});
    await expect(page.locator("#studioBiomeEditStatus")).toHaveText("Applied");

    await page.locator("#studioBiomeSearchInput").fill("timber");
    await expect(workbench.locator("[data-studio-action='direct-biome-select']").first()).toContainText("timber");
  });

  test("links native state capitals to the burgs workbench", async ({page}) => {
    await openEditorsWorkspace(page);

    const statesWorkbench = page.locator(".studio-direct-editor").first();
    const burgsWorkbench = page.locator(".studio-direct-burg-editor").first();
    const provincesWorkbench = page.locator(".studio-direct-province-editor").first();
    const diplomacyWorkbench = page.locator(".studio-direct-diplomacy-editor").first();
    const stateWithCapital = await page.evaluate(() => {
      const states = ((window as any).pack.states || []).filter((state: any) => state && !state.removed && state.i > 0 && state.capital);
      const state = states[0];
      return {stateId: state.i, capitalId: state.capital};
    });

    await statesWorkbench.locator(`[data-studio-action='direct-state-select'][data-state-id='${stateWithCapital.stateId}']`).click();
    await statesWorkbench.locator("[data-studio-action='direct-burg-filter-state']").click();
    await expect(page.locator("#studioBurgFilterSelect")).toHaveValue("selected-state");
    await expect(burgsWorkbench).toHaveClass(/is-jump-highlight/);
    await burgsWorkbench.locator("[data-studio-action='direct-burg-select']").first().waitFor({state: "visible"});

    await statesWorkbench.locator("[data-studio-action='direct-burg-select']").click();
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-type", "burg");
    await expect(page.locator("#studioBalanceFocusOverlay")).toHaveAttribute("data-target-id", String(stateWithCapital.capitalId));
    await expect(burgsWorkbench.locator(".studio-state-row.is-active")).toHaveAttribute("data-burg-id", String(stateWithCapital.capitalId));

    await statesWorkbench.locator("[data-studio-action='direct-province-filter-state']").click();
    await expect(page.locator("#studioProvinceFilterSelect")).toHaveValue("selected-state");
    await expect(provincesWorkbench).toHaveClass(/is-jump-highlight/);

    await statesWorkbench.locator("[data-studio-action='direct-diplomacy-open-state']").click();
    await expect(page.locator("#studioDiplomacySubjectSelect")).toHaveValue(String(stateWithCapital.stateId));
    await expect(diplomacyWorkbench).toHaveClass(/is-jump-highlight/);
  });

  test("routes States editor buttons to the workbench without opening a dialog", async ({page}) => {
    await openEditorsWorkspace(page);

    await nativeStatesChip(page).click();

    await expect(page.locator(".studio-direct-editor").first()).toBeVisible();
    await expect(page.locator(".studio-direct-editor").first()).toContainText("Direct edit");
    await expect(editorDialog(page, "statesEditor")).toBeHidden();
    await expect(page.locator(".studio-statusbar")).toContainText("Editor: Closed");
  });

  test("remembers the origin section and supports returning without closing the editor", async ({page}) => {
    const editorsNav = sectionNav(page, "editors");
    const projectNav = sectionNav(page, "project");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const firstEditor = editorCases[0];

    await expect(projectNav).toHaveClass(/is-active/);
    await openEditorsWorkspace(page);
    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Project Center");

    await openEditor(page, firstEditor.action, firstEditor.dialogId);
    await expect(editorsPanel).toContainText("Active");
    await expect(editorsPanel).toContainText(firstEditor.label);
    await expect(editorsPanel.getByRole("button", {name: "Back to Project Center"})).toBeVisible();
    await expectEditorState(page, firstEditor.label);

    await editorsPanel.getByRole("button", {name: "Back to Project Center"}).click();
    await expect(projectNav).toHaveClass(/is-active/);
    await editorDialog(page, firstEditor.dialogId).waitFor({state: "visible", timeout: 5000});
    await expect(page.locator(".studio-statusbar")).toContainText(`Editor: Open · ${firstEditor.label}`);
  });

  test("keeps shell state aligned while switching across detailed editors", async ({page}) => {
    const editorsNav = sectionNav(page, "editors");

    await openEditorsWorkspace(page);

    for (const [index, editorCase] of editorCases.entries()) {
      await openEditor(page, editorCase.action, editorCase.dialogId);
      await expect(editorsNav).toHaveClass(/is-active/);
      await expectEditorState(page, editorCase.label);

      if (index > 0) {
        const previousEditor = editorCases[index - 1];
        await expect(editorDialog(page, previousEditor.dialogId)).toBeHidden();
      }
    }
  });

  test("keeps the same editor dialog stable when reopening the active editor", async ({page}) => {
    const editorCase = editorCases[0];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label);

    const firstDialogHandle = await editorDialog(page, editorCase.dialogId).elementHandle();
    expect(firstDialogHandle).not.toBeNull();
    const visibleBeforeReopen = await getVisibleDialogCount(page);

    await editorButton(page, editorCase.action).click();

    await expectEditorState(page, editorCase.label);
    await expect(editorDialog(page, editorCase.dialogId)).toBeVisible();
    await expect.poll(() => getVisibleDialogCount(page), {timeout: 5000}).toBe(visibleBeforeReopen);

    const reopenedDialogHandle = await editorDialog(page, editorCase.dialogId).elementHandle();
    expect(reopenedDialogHandle).toBeTruthy();
    expect(await reopenedDialogHandle!.evaluate((node, first) => node === first, firstDialogHandle)).toBe(true);
  });

  test("tracks an editor-side close and allows reopening from the shell", async ({page}) => {
    const editorsNav = sectionNav(page, "editors");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const editorCase = editorCases[1];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label);

    await closeEditorFromEditorSurface(page, editorCase.dialogId);
    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorsWorkspace(page);
    await expect(editorsPanel).toContainText("Status");
    await expect(editorsPanel).toContainText("Closed");
    await expect(editorsPanel).toContainText("Editor surface");
    await expect(editorsPanel).toContainText("—");

    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label);
  });

  test("keeps the returned section stable when the editor dialog closes afterwards", async ({page}) => {
    const projectNav = sectionNav(page, "project");
    const editorsNav = sectionNav(page, "editors");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const editorCase = editorCases[0];

    await expect(projectNav).toHaveClass(/is-active/);
    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await editorsPanel.getByRole("button", {name: "Back to Project Center"}).click();

    await expect(projectNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(editorDialog(page, editorCase.dialogId)).toBeVisible();
    await expect(statusBar).toContainText(`Editor: Open · ${editorCase.label}`);

    await closeEditorFromEditorSurface(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Projects");
  });

  test("enters and exits the editors workflow when an editor opens outside the shell", async ({page}) => {
    const projectNav = sectionNav(page, "project");
    const editorsNav = sectionNav(page, "editors");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const statusBar = page.locator(".studio-statusbar");
    const editorCase = editorCases[2];

    await expect(projectNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorFromExternalSurface(page, editorCase.action, editorCase.dialogId);

    await expect.poll(async () => await page.locator(".studio-nav__item.is-active").textContent(), {timeout: 5000}).toContain("Editor");
    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Project Center");
    await expectEditorState(page, editorCase.label);

    await closeEditorFromEditorSurface(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can close the active editor directly from the Studio shell", async ({page}) => {
    const editorsNav = sectionNav(page, "editors");
    const projectNav = sectionNav(page, "project");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const editorCase = editorCases[3];

    await expect(projectNav).toHaveClass(/is-active/);
    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label);
    await expect(editorsPanel.getByRole("button", {name: "Close editor"})).toBeVisible();

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Projects");
  });

  test("keeps editor shortcuts out of slimmed non-editor workspaces", async ({page}) => {
    for (const section of ["project", "canvas", "style", "layers", "export", "data"]) {
      await sectionNav(page, section).click();
      await expect(sectionNav(page, section)).toHaveClass(/is-active/);
      await expect(page.locator(".studio-sidebar--right")).not.toContainText("Suggested workflow");
      await expect(page.locator(".studio-sidebar--right [data-studio-action='editor']:visible")).toHaveCount(0);
    }
  });

  test("keeps native editor entry points centralized in the Editors workspace", async ({page}) => {
    await openEditorsWorkspace(page);

    const openEditorPanel = page.locator(".studio-sidebar--right .studio-panel").filter({hasText: "Open editor"}).first();
    await expect(openEditorPanel.getByRole("button", {name: "States"})).toBeVisible();
    await expect(openEditorPanel.getByRole("button", {name: "Biomes"})).toBeVisible();
    await expect(openEditorPanel.getByRole("button", {name: "Provinces"})).toBeVisible();

    await openEditorPanel.getByRole("button", {name: "Biomes"}).click();

    await expectEditorState(page, "Biomes");
  });

  test("returns to the original non-canvas section after an externally opened editor closes", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");
    const editorsNav = sectionNav(page, "editors");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-editor-status-panel").first();
    const statusBar = page.locator(".studio-statusbar");
    const editorCase = editorCases[2];

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorFromExternalSurface(page, editorCase.action, editorCase.dialogId);

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Style");
    await expect(editorsPanel.getByRole("button", {name: "Back to Style"})).toBeVisible();
    await expectEditorState(page, editorCase.label);

    await closeEditorFromEditorSurface(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Map Params");
  });
});
