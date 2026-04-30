import {test, expect} from "@playwright/test";
import fs from "fs/promises";
import path from "path";

test.describe.configure({timeout: 90000});

async function resetIndexedDbSnapshot(page: Parameters<typeof test>[0]["page"]) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("d2");
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!Array.from(db.objectStoreNames).includes("s")) db.createObjectStore("s", {keyPath: "key"});
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("s", "readwrite");
        const store = transaction.objectStore("s");
        store.put({key: "lastMap", value: null});
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
}

async function setIndexedDbSnapshot(page: Parameters<typeof test>[0]["page"], value: string) {
  await page.evaluate(async payload => {
    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("d2");
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!Array.from(db.objectStoreNames).includes("s")) db.createObjectStore("s", {keyPath: "key"});
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("s", "readwrite");
        const store = transaction.objectStore("s");
        store.put({key: "lastMap", value: new Blob([payload], {type: "text/plain"})});
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, value);
}

function projectGeneratePanel(page: Parameters<typeof test>[0]["page"]) {
  return page.locator(".studio-sidebar--right .studio-panel").filter({has: page.getByRole("heading", {name: "Generate map"})}).first();
}

function projectMapSettingsPanel(page: Parameters<typeof test>[0]["page"]) {
  return page.locator(".studio-sidebar--right .studio-panel").filter({has: page.getByRole("heading", {name: "Map settings"})}).first();
}

function projectDocumentPanelLocator(page: Parameters<typeof test>[0]["page"]) {
  return page.locator("[data-studio-project-document='true']").first();
}

async function openBalanceChecker(page: Parameters<typeof test>[0]["page"]) {
  const section = page.locator("[data-studio-advanced='balance-checker']");
  await expect(section.locator("summary")).toBeVisible();
  const isOpen = await section.evaluate(element => (element as HTMLDetailsElement).open);
  if (!isOpen) await section.locator("summary").click();
  return section.locator("#studioBalanceCheckerPanel");
}

async function openExportWorkspace(page: Parameters<typeof test>[0]["page"]) {
  const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
  await exportNav.click();
  await expect(exportNav).toHaveClass(/is-active/);
}

async function openDetailsBySummary(page: Parameters<typeof test>[0]["page"], summaryText: string) {
  const details = page.locator(".studio-sidebar--right details").filter({hasText: summaryText}).first();
  await expect(details.locator("summary")).toBeVisible();
  await details.evaluate(element => {
    (element as HTMLDetailsElement).open = true;
  });
  return details;
}

async function openDataDropboxDetails(page: Parameters<typeof test>[0]["page"]) {
  return openDetailsBySummary(page, "Dropbox and sharing");
}

async function openDataAdvancedLoadingDetails(page: Parameters<typeof test>[0]["page"]) {
  return openDetailsBySummary(page, "Advanced loading");
}

async function openProjectGenerationDetails(page: Parameters<typeof test>[0]["page"]) {
  return openBalanceChecker(page);
}

async function fillGeneratorParameter(page: Parameters<typeof test>[0]["page"], key: string, value: string) {
  const panel = await openProjectGenerationDetails(page);
  const input = panel.locator(`[data-generator-parameter-key='${key}']`);
  await input.fill(value);
  await input.blur();
}

async function clickAutoFixHistory(page: Parameters<typeof test>[0]["page"], action: "undo" | "redo") {
  const panel = await openBalanceChecker(page);
  await panel.locator(`[data-studio-action='auto-fix-history'][data-value='${action}']`).click();
}

async function clickAutoFixDraftButton(page: Parameters<typeof test>[0]["page"], draftId: string, name: string) {
  const panel = await openBalanceChecker(page);
  await panel.locator(`[data-auto-fix-draft-id='${draftId}']`).getByRole("button", {name}).click();
}

async function setBiomeRule(page: Parameters<typeof test>[0]["page"], biomeId: number, weight: string, tag: string) {
  const panel = await openBalanceChecker(page);
  const card = panel.locator(`[data-biome-rule-id='${biomeId}']`);
  await card.locator(`[data-biome-rule-weight='${biomeId}']`).fill(weight);
  await card.locator(`[data-biome-resource-tag='${biomeId}']`).selectOption(tag);
  await card.getByRole("button", {name: "Adjust biome rule"}).click();
}

async function clickAdvancedExportButton(page: Parameters<typeof test>[0]["page"], buttonName: string) {
  const details = await openDetailsBySummary(page, "Advanced formats");
  await details.getByRole("button", {name: buttonName}).click();
}

async function clickEngineHandoffButton(page: Parameters<typeof test>[0]["page"], buttonName: string) {
  const details = await openDetailsBySummary(page, "Engine handoff");
  await details.getByRole("button", {name: buttonName}).click();
}

async function studioViewportSnapshot(page: Parameters<typeof test>[0]["page"]) {
  return page.evaluate(() => {
    const stage = document.getElementById("studioStageViewport") as HTMLElement | null;
    const frame = document.getElementById("studioCanvasFrame") as HTMLElement | null;
    const zoom = document.querySelector(".studio-map-zoom") as HTMLElement | null;
    const map = document.getElementById("map") as SVGSVGElement | null;
    const viewbox = document.getElementById("viewbox") as SVGGElement | null;
    if (!stage || !frame || !zoom || !map) return null;
    const stageRect = stage.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const zoomRect = zoom.getBoundingClientRect();
    const transform = frame.style.transform;
    const frameScaleMatch = /scale\(([^)]+)\)/u.exec(transform);
    const viewboxTransform = viewbox?.getAttribute("transform") || "";
    const viewboxScaleMatch = /scale\(([^\s)]+)(?:\s+([^\s)]+))?\)/u.exec(viewboxTransform);
    const viewboxScaleX = viewboxScaleMatch ? Number(viewboxScaleMatch[1]) : null;
    const viewboxScaleY = viewboxScaleMatch ? Number(viewboxScaleMatch[2] ?? viewboxScaleMatch[1]) : null;
    return {
      frameWidth: Math.round(frameRect.width),
      frameHeight: Math.round(frameRect.height),
      stageWidth: Math.round(stageRect.width),
      stageHeight: Math.round(stageRect.height),
      stageCanScrollVertically: stage.scrollHeight > stage.clientHeight,
      stageCanScrollHorizontally: stage.scrollWidth > stage.clientWidth,
      stageOverflowY: window.getComputedStyle(stage).overflowY,
      stageScrollTop: stage.scrollTop,
      zoomInsideFrame: frame.contains(zoom),
      zoomInsideStage:
        zoomRect.left >= stageRect.left - 1 &&
        zoomRect.top >= stageRect.top - 1 &&
        zoomRect.right <= stageRect.right + 1 &&
        zoomRect.bottom <= stageRect.bottom + 1,
      overflowLeft: Math.round((stageRect.left - frameRect.left) * 10) / 10,
      overflowTop: Math.round((stageRect.top - frameRect.top) * 10) / 10,
      overflowRight: Math.round((frameRect.right - stageRect.right) * 10) / 10,
      overflowBottom: Math.round((frameRect.bottom - stageRect.bottom) * 10) / 10,
      frameFullyVisible:
        frameRect.left >= stageRect.left - 1 &&
        frameRect.top >= stageRect.top - 1 &&
        frameRect.right <= stageRect.right + 1 &&
        frameRect.bottom <= stageRect.bottom + 1,
      styleWidth: frame.style.width,
      styleHeight: frame.style.height,
      fitMode: frame.dataset.fitMode,
      orientation: frame.dataset.orientation,
      scale: frameScaleMatch ? Number(frameScaleMatch[1]) : null,
      mapWidth: map.getAttribute("width"),
      mapHeight: map.getAttribute("height"),
      viewboxTransform,
      viewboxScaleX,
      viewboxScaleY,
    };
  });
}

test.describe("Studio export and data workflow", () => {
  test.beforeEach(async ({context, page}) => {
    await context.clearCookies();

    await page.goto("/", {waitUntil: "domcontentloaded"});
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("agm-studio-language", "en");
    });
    await resetIndexedDbSnapshot(page);

    await page.goto("/?seed=test-studio-export-data&width=1280&height=720");
    await page.waitForFunction(() => (window as any).mapId !== undefined, {timeout: 60000});
    await page.locator("#studioApp").waitFor({state: "visible", timeout: 10000});
    await page.waitForFunction(
      () => {
        const loading = document.getElementById("loading") as HTMLElement | null;
        const loadingHidden = !loading || Number.parseFloat(window.getComputedStyle(loading).opacity || "1") < 0.1;
        return loadingHidden && typeof (window as any).exportToSvg === "function" && typeof (window as any).saveMap === "function";
      },
      {timeout: 15000},
    );
    await page.waitForTimeout(500);
  });

  test("keeps viewport presets, orientation, and fit modes usable in the product shell", async ({page}) => {
    const initialLandscapeSnapshot = await studioViewportSnapshot(page);
    expect(initialLandscapeSnapshot?.orientation).toBe("landscape");
    expect(initialLandscapeSnapshot!.fitMode).toBe("cover");
    expect(initialLandscapeSnapshot!.frameFullyVisible, JSON.stringify(initialLandscapeSnapshot, null, 2)).toBe(false);
    expect(initialLandscapeSnapshot!.frameWidth).toBeGreaterThan(initialLandscapeSnapshot!.stageWidth);
    expect(initialLandscapeSnapshot!.frameHeight).toBeGreaterThan(initialLandscapeSnapshot!.stageHeight - 56);
    expect(initialLandscapeSnapshot!.viewboxTransform).not.toContain("rotate(90)");

    await page.locator("[data-studio-action='fitmode'][data-value='contain']").first().click();
    const containLandscapeSnapshot = await studioViewportSnapshot(page);
    expect(containLandscapeSnapshot!.orientation).toBe("landscape");
    expect(containLandscapeSnapshot!.fitMode).toBe("contain");
    expect(containLandscapeSnapshot!.frameFullyVisible, JSON.stringify(containLandscapeSnapshot, null, 2)).toBe(true);
    expect(containLandscapeSnapshot!.frameWidth).toBeGreaterThanOrEqual(containLandscapeSnapshot!.stageWidth - 56);
    expect(containLandscapeSnapshot!.frameHeight).toBeGreaterThan(0);
    expect(containLandscapeSnapshot!.frameHeight).toBeLessThanOrEqual(containLandscapeSnapshot!.stageHeight);
    expect(initialLandscapeSnapshot!.viewboxScaleX!).toBeGreaterThan(containLandscapeSnapshot!.viewboxScaleX!);

    await page.locator("[data-studio-action='orientation'][data-value='portrait']").first().click();
    await expect.poll(() => studioViewportSnapshot(page)).toMatchObject({
      styleWidth: "900px",
      styleHeight: "1440px",
      orientation: "portrait",
      fitMode: "contain",
      mapWidth: "900",
      mapHeight: "1440",
    });

    const portraitSnapshot = await studioViewportSnapshot(page);
    expect(portraitSnapshot?.scale).toBeTruthy();
    expect(portraitSnapshot!.scale!).toBeLessThan(1);
    expect(portraitSnapshot!.frameFullyVisible, JSON.stringify(portraitSnapshot, null, 2)).toBe(true);
    expect(portraitSnapshot!.viewboxScaleX).toBeGreaterThan(0);
    expect(portraitSnapshot!.viewboxScaleX).toBe(portraitSnapshot!.viewboxScaleY);
    expect(portraitSnapshot!.viewboxTransform).toContain("rotate(90)");
    expect(portraitSnapshot!.viewboxTransform).not.toMatch(/scale\([^\s)]+\s+[^\s)]+\)/u);

    await page.locator("[data-studio-action='viewport-zoom'][data-value='in']").click();
    const zoomedPortraitSnapshot = await studioViewportSnapshot(page);
    expect(zoomedPortraitSnapshot!.viewboxScaleX!).toBeGreaterThan(portraitSnapshot!.viewboxScaleX!);

    await page.locator("[data-studio-action='viewport-zoom'][data-value='reset']").click();
    const resetPortraitSnapshot = await studioViewportSnapshot(page);
    expect(resetPortraitSnapshot!.viewboxScaleX).toBe(portraitSnapshot!.viewboxScaleX);

    await page.locator("[data-studio-action='fitmode'][data-value='actual-size']").first().click();
    const actualPortraitSnapshot = await studioViewportSnapshot(page);
    expect(actualPortraitSnapshot).toMatchObject({
      styleWidth: "900px",
      styleHeight: "1440px",
      orientation: "portrait",
      fitMode: "actual-size",
      scale: 1,
      mapWidth: "900",
      mapHeight: "1440",
      stageCanScrollVertically: true,
      zoomInsideFrame: false,
      zoomInsideStage: true,
    });
    expect(["auto", "scroll"]).toContain(actualPortraitSnapshot!.stageOverflowY);

    await page.locator("#studioTopbarPresetSelect").selectOption("mobile-landscape");
    await expect.poll(() => studioViewportSnapshot(page)).toMatchObject({
      styleWidth: "390px",
      styleHeight: "844px",
      orientation: "portrait",
      fitMode: "actual-size",
      scale: 1,
      mapWidth: "390",
      mapHeight: "844",
    });

    await page.locator("[data-studio-action='orientation'][data-value='landscape']").first().click();
    await page.locator("[data-studio-action='fitmode'][data-value='contain']").first().click();
    const mobileLandscapeSnapshot = await studioViewportSnapshot(page);
    expect(mobileLandscapeSnapshot!.orientation).toBe("landscape");
    expect(mobileLandscapeSnapshot!.fitMode).toBe("contain");
    expect(mobileLandscapeSnapshot!.frameFullyVisible, JSON.stringify(mobileLandscapeSnapshot, null, 2)).toBe(true);
    expect(mobileLandscapeSnapshot!.frameWidth).toBeGreaterThanOrEqual(mobileLandscapeSnapshot!.stageWidth - 56);
    expect(mobileLandscapeSnapshot!.frameHeight).toBeGreaterThan(0);
    expect(mobileLandscapeSnapshot!.frameHeight).toBeLessThanOrEqual(mobileLandscapeSnapshot!.stageHeight);
    expect(mobileLandscapeSnapshot!.viewboxTransform).not.toContain("rotate(90)");
  });

  test("routes export actions and settings through the Studio shell", async ({page}) => {
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");

    await exportNav.click();
    await expect(exportNav).toHaveClass(/is-active/);

    await page.evaluate(() => {
      (window as any).__studioExportCalls = [];
      const w = window as any;
      const originalSvg = w.exportToSvg;
      const originalPng = w.exportToPng;
      const originalJpeg = w.exportToJpeg;

      w.exportToSvg = () => {
        w.__studioExportCalls.push("svg");
      };
      w.exportToPng = () => {
        w.__studioExportCalls.push("png");
      };
      w.exportToJpeg = () => {
        w.__studioExportCalls.push("jpeg");
      };

      w.__studioExportRestore = () => {
        w.exportToSvg = originalSvg;
        w.exportToPng = originalPng;
        w.exportToJpeg = originalJpeg;
      };
    });

    await page.locator("[data-studio-action='export-format'][data-value='svg']").click();
    await expect(page.locator("[data-studio-action='run-export']")).toContainText("Export current image SVG");
    await page.locator("[data-studio-action='run-export']").click();

    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();
    await expect(page.locator("[data-studio-action='run-export']")).toContainText("Export current image JPEG");
    await page.locator("[data-studio-action='run-export']").click();

    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await expect(page.locator("[data-studio-action='run-export']")).toContainText("Export current image PNG");
    await page.locator("[data-studio-action='run-export']").click();

    await expect
      .poll(() => page.evaluate(() => (window as any).__studioExportCalls))
      .toEqual(["svg", "jpeg", "png"]);

    await page.locator("#studioPngResolutionInput").fill("3");
    await page.locator("#studioPngResolutionInput").dispatchEvent("change");
    await expect.poll(() => page.locator("#pngResolutionInput").inputValue()).toBe("3");

    await page.locator("#studioTileColsInput").fill("4");
    await page.locator("#studioTileColsInput").dispatchEvent("change");
    await expect.poll(() => page.locator("#tileColsOutput").inputValue()).toBe("4");

    await page.locator("#studioTileRowsInput").fill("5");
    await page.locator("#studioTileRowsInput").dispatchEvent("change");
    await expect.poll(() => page.locator("#tileRowsOutput").inputValue()).toBe("5");

    await page.locator("#studioTileScaleInput").fill("2");
    await page.locator("#studioTileScaleInput").dispatchEvent("change");
    await expect.poll(() => page.locator("#tileScaleOutput").inputValue()).toBe("2");

    await page.evaluate(() => {
      (window as any).__studioExportRestore?.();
    });
  });

  test("keeps export explicit when switching formats", async ({page}) => {
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const runExport = page.locator("[data-studio-action='run-export']");

    await exportNav.click();
    await expect(exportNav).toHaveClass(/is-active/);

    await page.evaluate(() => {
      (window as any).__studioExportCalls = [];
      const w = window as any;
      const originalSvg = w.exportToSvg;
      const originalPng = w.exportToPng;
      const originalJpeg = w.exportToJpeg;

      w.exportToSvg = () => {
        w.__studioExportCalls.push("svg");
      };
      w.exportToPng = () => {
        w.__studioExportCalls.push("png");
      };
      w.exportToJpeg = () => {
        w.__studioExportCalls.push("jpeg");
      };

      w.__studioExportRestore = () => {
        w.exportToSvg = originalSvg;
        w.exportToPng = originalPng;
        w.exportToJpeg = originalJpeg;
      };
    });

    await page.locator("[data-studio-action='export-format'][data-value='svg']").click();
    await expect(runExport).toContainText("Export current image SVG");
    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();
    await expect(runExport).toContainText("Export current image JPEG");
    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await expect(runExport).toContainText("Export current image PNG");

    await expect.poll(() => page.evaluate(() => (window as any).__studioExportCalls)).toEqual([]);

    await runExport.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioExportCalls)).toEqual(["png"]);

    await page.evaluate(() => {
      (window as any).__studioExportRestore?.();
    });
  });

  test("surfaces all high-frequency data actions in the Studio shell", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const sourceRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Source/,
    });
    const loadDetailRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Load detail/,
    });
    const lastSaveRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Last save/,
    });
    const saveDetailRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Save detail/,
    });
    const dropboxStatusRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Dropbox(Connected|File selected|Not connected)$/,
    });
    const dropboxFileRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Dropbox file/,
    });
    const shareLinkRow = dataPanel.locator(".studio-kv").filter({
      hasText: /^Share link/,
    });

    await expect(dataPanel.getByRole("button", {name: "Quick load"})).toBeVisible();
    await expect(dataPanel.getByRole("button", {name: "Save to storage"})).toBeVisible();
    await expect(dataPanel.getByRole("button", {name: "Download"})).toBeVisible();
    await expect(dataPanel.getByRole("button", {name: "New map"})).toBeVisible();
    await expect(dataPanel.getByRole("button", {name: "Open file"})).toBeVisible();
    await expect(dataPanel.getByRole("button", {name: "Save Dropbox"})).toHaveCount(0);
    await expect(dataPanel.getByRole("button", {name: "Load URL"})).toHaveCount(0);
    let dropboxDetails = await openDataDropboxDetails(page);
    let advancedLoadingDetails = await openDataAdvancedLoadingDetails(page);
    await expect(dropboxDetails.getByRole("button", {name: "Save Dropbox"})).toBeVisible();
    await expect(dropboxDetails.getByRole("button", {name: "Connect Dropbox"})).toBeVisible();
    await expect(dropboxDetails.getByRole("button", {name: "Load Dropbox"})).toBeVisible();
    await expect(dropboxDetails.getByRole("button", {name: "Share Dropbox"})).toBeVisible();
    await expect(advancedLoadingDetails.getByRole("button", {name: "Load URL"})).toBeVisible();
    await expect(dataPanel).toContainText("Snapshot");
    await expect(sourceRow).toContainText("Generated");
    await expect(loadDetailRow).toContainText("Current settings");
    await expect(lastSaveRow).toContainText("Not saved yet");
    await expect(saveDetailRow).toContainText("—");
    await expect(dropboxFileRow).toContainText("—");
    await expect(shareLinkRow).toContainText("Not created");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioDataCalls = [];
      const originalQuickLoad = w.quickLoad;
      const originalSaveMap = w.saveMap;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      const originalLoadURL = w.loadURL;
      const originalConnectToDropbox = w.connectToDropbox;
      const originalLoadFromDropbox = w.loadFromDropbox;
      const originalCreateSharableDropboxLink = w.createSharableDropboxLink;
      const originalLoadMapFromURL = w.loadMapFromURL;
      const originalUploadMap = w.uploadMap;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const dropboxConnectButton = document.getElementById("dropboxConnectButton") as HTMLButtonElement | null;
      const dropboxSelect = document.getElementById("loadFromDropboxSelect") as HTMLSelectElement | null;
      const dropboxButtons = document.getElementById("loadFromDropboxButtons") as HTMLDivElement | null;
      const sharableLinkContainer = document.getElementById("sharableLinkContainer") as HTMLDivElement | null;
      const sharableLink = document.getElementById("sharableLink") as HTMLAnchorElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);

      w.quickLoad = async () => {
        w.__studioDataCalls.push("quick-load");
      };
      w.saveMap = async (target: string) => {
        w.__studioDataCalls.push(`save:${target}`);
      };
      w.generateMapOnLoad = async () => {
        w.__studioDataCalls.push("new-map");
      };
      w.loadURL = () => {
        w.__studioDataCalls.push("load-url");
        w.loadMapFromURL?.("https://e-cloud.com/test.map");
      };
      w.connectToDropbox = async () => {
        w.__studioDataCalls.push("connect-dropbox");
        if (dropboxConnectButton) dropboxConnectButton.style.display = "none";
        if (dropboxSelect) {
          dropboxSelect.style.display = "block";
          dropboxSelect.innerHTML = "";
          dropboxSelect.options.add(new Option("Dropbox test.map", "/studio/test.map"));
          dropboxSelect.value = "/studio/test.map";
        }
        if (dropboxButtons) dropboxButtons.style.display = "block";
      };
      w.loadFromDropbox = async () => {
        w.__studioDataCalls.push("load-dropbox");
      };
      w.createSharableDropboxLink = async () => {
        w.__studioDataCalls.push("share-dropbox");
        if (sharableLinkContainer) sharableLinkContainer.style.display = "block";
        if (sharableLink) sharableLink.href = "https://example.com/shared/test-map";
      };
      w.loadMapFromURL = (maplink: string) => {
        if (w.mapName) w.mapName.value = "URL Import Map";
        w.seed = "url-import-seed";
        w.uploadMap?.(new Blob(["url"], {type: "application/octet-stream"}));
      };
      w.uploadMap = (file: Blob | File) => {
        if (file && typeof file === "object" && "name" in file && file.name === "url-import.map") return;
        originalUploadMap?.(file);
      };
      if (dropboxConnectButton) dropboxConnectButton.style.display = "inline-block";
      if (dropboxSelect) {
        dropboxSelect.style.display = "none";
        dropboxSelect.innerHTML = "";
      }
      if (dropboxButtons) dropboxButtons.style.display = "none";
      if (sharableLinkContainer) sharableLinkContainer.style.display = "none";
      if (sharableLink) sharableLink.removeAttribute("href");
      if (fileInput) {
        fileInput.click = () => {
          w.__studioDataCalls.push("open-file");
          w.uploadMap?.(new File(["open"], "picked-from-disk.map", {type: "application/octet-stream"}));
        };
      }

      w.__studioDataRestore = () => {
        w.quickLoad = originalQuickLoad;
        w.saveMap = originalSaveMap;
        w.generateMapOnLoad = originalGenerateMapOnLoad;
        w.loadURL = originalLoadURL;
        w.connectToDropbox = originalConnectToDropbox;
        w.loadFromDropbox = originalLoadFromDropbox;
        w.createSharableDropboxLink = originalCreateSharableDropboxLink;
        w.loadMapFromURL = originalLoadMapFromURL;
        w.uploadMap = originalUploadMap;
        if (dropboxConnectButton) dropboxConnectButton.style.display = "inline-block";
        if (dropboxSelect) {
          dropboxSelect.style.display = "none";
          dropboxSelect.innerHTML = "";
        }
        if (dropboxButtons) dropboxButtons.style.display = "none";
        if (sharableLinkContainer) sharableLinkContainer.style.display = "none";
        if (sharableLink) sharableLink.removeAttribute("href");
        if (fileInput && originalFileInputClick) fileInput.click = originalFileInputClick;
      };
    });

    await dataPanel.getByRole("button", {name: "Quick load"}).click();
    await expect(sourceRow).toContainText("Browser snapshot");
    await expect(loadDetailRow).toContainText("Quick load");
    await dataPanel.getByRole("button", {name: "Save to storage"}).click();
    await expect(lastSaveRow).toContainText("Browser snapshot");
    await expect(saveDetailRow).toContainText(/\.map$/);
    await dataPanel.getByRole("button", {name: "Download"}).click();
    await expect(lastSaveRow).toContainText("Downloads");
    await expect(saveDetailRow).toContainText(/\.map$/);
    dropboxDetails = await openDataDropboxDetails(page);
    await dropboxDetails.getByRole("button", {name: "Save Dropbox"}).click();
    await expect(lastSaveRow).toContainText("Dropbox");
    await expect(saveDetailRow).toContainText(/\.map$/);
    dropboxDetails = await openDataDropboxDetails(page);
    await dropboxDetails.getByRole("button", {name: "Connect Dropbox"}).click();
    await expect(dropboxStatusRow).toContainText("File selected");
    await expect(dropboxFileRow).toContainText("Dropbox test.map");
    dropboxDetails = await openDataDropboxDetails(page);
    await dropboxDetails.getByRole("button", {name: "Load Dropbox"}).click();
    await expect(loadDetailRow).toContainText("Dropbox test.map");
    dropboxDetails = await openDataDropboxDetails(page);
    await dropboxDetails.getByRole("button", {name: "Share Dropbox"}).click();
    await expect(shareLinkRow).toContainText("Ready");
    await dataPanel.getByRole("button", {name: "New map"}).click();
    await expect(sourceRow).toContainText("Generated");
    await expect(loadDetailRow).toContainText("Current settings");
    await dataPanel.getByRole("button", {name: "Open file"}).click();
    await expect(sourceRow).toContainText("Local file");
    await expect(loadDetailRow).toContainText("picked-from-disk.map");
    advancedLoadingDetails = await openDataAdvancedLoadingDetails(page);
    await advancedLoadingDetails.getByRole("button", {name: "Load URL"}).click();
    await expect(sourceRow).toContainText("URL");
    await expect(loadDetailRow).toContainText("e-cloud.com/test.map");

    await expect
      .poll(() => page.evaluate(() => (window as any).__studioDataCalls))
      .toEqual(["quick-load", "save:storage", "save:machine", "save:dropbox", "connect-dropbox", "load-dropbox", "share-dropbox", "new-map", "open-file", "load-url"]);

    await page.evaluate(() => {
      (window as any).__studioDataRestore?.();
    });
  });

  test("writes back snapshot and seed state after data actions", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});

    await expect(snapshotRow).toContainText("None");

    await page.evaluate(() => {
      const w = window as any;
      const originalSaveMap = w.saveMap;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      const originalSeed = w.seed;
      const originalMapName = w.mapName?.value;

      w.__studioDataWritebackRestore = {
        saveMap: originalSaveMap,
        generateMapOnLoad: originalGenerateMapOnLoad,
        seed: originalSeed,
        mapName: originalMapName,
      };

      w.saveMap = async (target: string) => {
        if (target === "storage") {
          localStorage.setItem("lastMap", JSON.stringify({id: "studio-writeback"}));
        }
      };
      w.generateMapOnLoad = async () => {
        w.seed = "writeback-seed";
        if (w.mapName) w.mapName.value = "Writeback map";
      };
    });

    await dataPanel.getByRole("button", {name: "Save to storage"}).click();
    await expect(snapshotRow).toContainText("Available");

    await dataPanel.getByRole("button", {name: "New map"}).click();
    await expect(seedRow).toContainText("writeback-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioDataWritebackRestore;
      if (!restore) return;

      w.saveMap = restore.saveMap;
      w.generateMapOnLoad = restore.generateMapOnLoad;
      w.seed = restore.seed;
      if (w.mapName) w.mapName.value = restore.mapName || "";
      localStorage.removeItem("lastMap");
      delete w.__studioDataWritebackRestore;
    });
  });

  test("keeps topbar export aligned with the current Studio export format", async ({page}) => {
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioTopbarExportCalls = [];
      const originalSvg = w.exportToSvg;
      const originalPng = w.exportToPng;
      const originalJpeg = w.exportToJpeg;

      w.exportToSvg = () => {
        w.__studioTopbarExportCalls.push("svg");
      };
      w.exportToPng = () => {
        w.__studioTopbarExportCalls.push("png");
      };
      w.exportToJpeg = () => {
        w.__studioTopbarExportCalls.push("jpeg");
      };

      w.__studioTopbarExportRestore = () => {
        w.exportToSvg = originalSvg;
        w.exportToPng = originalPng;
        w.exportToJpeg = originalJpeg;
      };
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='svg']").click();
    await topbarExport.click();

    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();
    await topbarExport.click();

    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await topbarExport.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioTopbarExportCalls)).toEqual(["svg", "jpeg", "png"]);

    await page.evaluate(() => {
      (window as any).__studioTopbarExportRestore?.();
    });
  });

  test("keeps Export image action aligned with the current Studio export format", async ({page}) => {
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioProjectExportCalls = [];
      const originalPng = w.exportToPng;
      w.exportToPng = () => {
        w.__studioProjectExportCalls.push("png");
      };
      w.__studioProjectExportRestore = () => {
        w.exportToPng = originalPng;
      };
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await page.locator("[data-studio-action='run-export']").click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectExportCalls)).toEqual(["png"]);

    await page.evaluate(() => {
      (window as any).__studioProjectExportRestore?.();
    });
  });

  test("does not dirty or rewrite workspace summary when export runs from topbar or Export", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("lastMap", JSON.stringify({id: "export-baseline"}));
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";

      w.__studioExportStabilityCalls = [];
      const originalPng = w.exportToPng;
      w.exportToPng = () => {
        w.__studioExportStabilityCalls.push("png");
      };
      w.__studioExportStabilityRestore = () => {
        w.exportToPng = originalPng;
      };
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await topbarExport.click();

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");
    await exportNav.click();
    await page.locator("[data-studio-action='run-export']").click();

    await dataNav.click();
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");
    await expect.poll(() => page.evaluate(() => (window as any).__studioExportStabilityCalls)).toEqual(["png", "png"]);

    await page.evaluate(() => {
      localStorage.removeItem("lastMap");
      (window as any).__studioExportStabilityRestore?.();
      delete (window as any).__studioExportStabilityCalls;
    });
  });

  test("keeps topbar export as a clean no-op when the current format handler is unavailable", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("lastMap", JSON.stringify({id: "missing-topbar-export"}));
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";

      w.__studioTopbarMissingExportRestore = {
        exportToSvg: w.exportToSvg,
      };
      w.exportToSvg = undefined;
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='svg']").click();
    await expect(page.locator("[data-studio-action='run-export']")).toContainText("Export current image SVG");
    await topbarExport.click();

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioTopbarMissingExportRestore;
      if (!restore) return;
      w.exportToSvg = restore.exportToSvg;
      delete w.__studioTopbarMissingExportRestore;
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps Export image label and summary stable when the current format handler is unavailable", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("lastMap", JSON.stringify({id: "missing-project-export"}));
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";

      w.__studioProjectMissingExportRestore = {
        exportToJpeg: w.exportToJpeg,
      };
      w.exportToJpeg = undefined;
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();

    await exportNav.click();
    await page.locator("[data-studio-action='run-export']").click();
    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectMissingExportRestore;
      if (!restore) return;
      w.exportToJpeg = restore.exportToJpeg;
      delete w.__studioProjectMissingExportRestore;
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps export format labels and summaries stable after an unavailable export attempt", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();
    const runExport = page.locator("[data-studio-action='run-export']");

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("lastMap", JSON.stringify({id: "failed-export-labels"}));
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";

      w.__studioFailedExportLabelRestore = {
        exportToJpeg: w.exportToJpeg,
      };
      w.exportToJpeg = undefined;
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();
    await expect(runExport).toContainText("Export current image JPEG");
    await expect(topbarExport).toContainText(/^Export$/);

    await runExport.click();
    await expect(runExport).toContainText("Export current image JPEG");
    await expect(topbarExport).toContainText(/^Export$/);

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioFailedExportLabelRestore;
      if (!restore) return;
      w.exportToJpeg = restore.exportToJpeg;
      delete w.__studioFailedExportLabelRestore;
      localStorage.removeItem("lastMap");
    });
  });

  test("recovers export after switching from an unavailable format back to a supported one", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();
    const runExport = page.locator("[data-studio-action='run-export']");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioExportRecoveryCalls = [];
      w.__studioExportRecoveryRestore = {
        exportToJpeg: w.exportToJpeg,
        exportToPng: w.exportToPng,
      };
      w.exportToJpeg = undefined;
      w.exportToPng = () => {
        w.__studioExportRecoveryCalls.push("png");
      };
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();
    await expect(runExport).toContainText("Export current image JPEG");
    await runExport.click();
    await expect.poll(() => page.evaluate(() => (window as any).__studioExportRecoveryCalls)).toEqual([]);

    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await expect(runExport).toContainText("Export current image PNG");
    await expect(topbarExport).toContainText(/^Export$/);
    await runExport.click();
    await expect.poll(() => page.evaluate(() => (window as any).__studioExportRecoveryCalls)).toEqual(["png"]);

    await expect(runExport).toContainText("Export current image PNG");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioExportRecoveryRestore;
      if (!restore) return;
      w.exportToJpeg = restore.exportToJpeg;
      w.exportToPng = restore.exportToPng;
      delete w.__studioExportRecoveryRestore;
      delete w.__studioExportRecoveryCalls;
    });
  });

  test("keeps export format and summaries stable after a throwing export handler", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");
    const topbarExport = page.locator("[data-studio-action='topbar'][data-value='export']").first();
    const runExport = page.locator("[data-studio-action='run-export']");

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("lastMap", JSON.stringify({id: "throwing-export"}));
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";

      w.__studioThrowingExportRestore = {
        exportToPng: w.exportToPng,
      };
      w.exportToPng = () => {
        throw new Error("export failed");
      };
    });

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='png']").click();
    await expect(runExport).toContainText("Export current image PNG");
    await expect(topbarExport).toContainText(/^Export$/);

    await runExport.click();
    await expect(runExport).toContainText("Export current image PNG");

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioThrowingExportRestore;
      if (!restore) return;
      w.exportToPng = restore.exportToPng;
      delete w.__studioThrowingExportRestore;
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps topbar shared actions consistent with Project and Data summaries", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const topbarSave = page.locator("[data-studio-action='topbar'][data-value='save']").first();
    const topbarNew = page.locator("[data-studio-action='topbar'][data-value='new']").first();

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "topbar-dirty-seed";
      if (w.mapName) w.mapName.value = "Topbar Dirty Map";
      localStorage.removeItem("lastMap");
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    await expect(dirtyRow).toContainText("Yes");
    await expect(seedRow).toContainText("topbar-dirty-seed");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioTopbarConsistencyRestore = {
        saveMap: w.saveMap,
        generateMapOnLoad: w.generateMapOnLoad,
      };

      w.saveMap = async () => {
        localStorage.setItem("lastMap", JSON.stringify({id: "topbar-save"}));
      };
      w.generateMapOnLoad = async () => {
        w.seed = "topbar-new-seed";
        if (w.mapName) w.mapName.value = "Topbar New Map";
        w.mapId = ((w.mapId as number) || Date.now()) + 1;
      };
    });

    await topbarSave.click();
    await expect(dirtyRow).toContainText("No");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/})).toContainText("Available");

    await topbarNew.click();
    await expect(seedRow).toContainText("topbar-new-seed");
    await expect(dirtyRow).toContainText("No");

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    await expect(projectDocumentPanel).toContainText("Topbar New Map");
    await expect(projectDocumentPanel).toContainText("topbar-new-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioTopbarConsistencyRestore;
      if (!restore) return;
      w.saveMap = restore.saveMap;
      w.generateMapOnLoad = restore.generateMapOnLoad;
      localStorage.removeItem("lastMap");
      delete w.__studioTopbarConsistencyRestore;
    });
  });

  test("keeps dirty state after save-to-machine failure writes a snapshot", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "save-machine-failure-seed";
      if (w.mapName) w.mapName.value = "Save Machine Failure Map";
      localStorage.removeItem("lastMap");
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("None");

    await page.evaluate(() => {
      const w = window as any;
      const originalSaveMap = w.saveMap;
      w.__studioSaveMachineFailureRestore = originalSaveMap;
      w.saveMap = async (target: string) => {
        if (target === "machine") {
          localStorage.setItem("lastMap", JSON.stringify({id: "save-machine-failure"}));
          throw new Error("save machine aborted");
        }
        return originalSaveMap?.(target);
      };
    });

    await dataPanel.getByRole("button", {name: "Download"}).click();
    await projectNav.click();
    await dataNav.click();

    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("Available");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText("save-machine-failure-seed");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioSaveMachineFailureRestore) {
        w.saveMap = w.__studioSaveMachineFailureRestore;
        delete w.__studioSaveMachineFailureRestore;
      }
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps dirty state after topbar save failure writes a snapshot", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const topbarSave = page.locator("[data-studio-action='topbar'][data-value='save']").first();

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "topbar-save-failure-seed";
      if (w.mapName) w.mapName.value = "Topbar Save Failure Map";
      localStorage.removeItem("lastMap");
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("None");

    await page.evaluate(() => {
      const w = window as any;
      const originalSaveMap = w.saveMap;
      w.__studioTopbarSaveFailureRestore = originalSaveMap;
      w.saveMap = async (target: string) => {
        if (target === "machine") {
          localStorage.setItem("lastMap", JSON.stringify({id: "topbar-save-failure"}));
          throw new Error("topbar save aborted");
        }
        return originalSaveMap?.(target);
      };
    });

    await topbarSave.click();
    await projectNav.click();
    await dataNav.click();

    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("Available");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText("topbar-save-failure-seed");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioTopbarSaveFailureRestore) {
        w.saveMap = w.__studioTopbarSaveFailureRestore;
        delete w.__studioTopbarSaveFailureRestore;
      }
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps Project new-map failure aligned with document and dirty state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "project-new-failure-baseline";
      if (w.mapName) w.mapName.value = "Project New Failure Baseline";
      localStorage.setItem("lastMap", JSON.stringify({id: "project-new-failure"}));
    });

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const quickActionsPanel = projectGeneratePanel(page);
    const workspacePanel = projectMapSettingsPanel(page);

    await page.evaluate(() => {
      const w = window as any;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      w.__studioProjectNewFailureRestore = originalGenerateMapOnLoad;
      w.generateMapOnLoad = async () => {
        w.seed = "project-new-failure-seed";
        if (w.mapName) w.mapName.value = "Project New Failure Map";
        w.mapId = ((w.mapId as number) || Date.now()) + 1;
        throw new Error("project new aborted");
      };
    });

    await quickActionsPanel.getByRole("button", {name: "Generate from current settings"}).click();
    await expect(projectDocumentPanel).toContainText("Project New Failure Map");
    await expect(projectDocumentPanel).toContainText("project-new-failure-seed");
    await expect(workspacePanel).toContainText("Available");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(seedRow).toContainText("project-new-failure-seed");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProjectNewFailureRestore) {
        w.generateMapOnLoad = w.__studioProjectNewFailureRestore;
        delete w.__studioProjectNewFailureRestore;
      }
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps topbar new-map failure aligned with document and dirty state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const topbarNew = page.locator("[data-studio-action='topbar'][data-value='new']").first();

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "topbar-new-failure-baseline";
      if (w.mapName) w.mapName.value = "Topbar New Failure Baseline";
      localStorage.setItem("lastMap", JSON.stringify({id: "topbar-new-failure"}));
    });

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const workspacePanel = projectMapSettingsPanel(page);

    await page.evaluate(() => {
      const w = window as any;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      w.__studioTopbarNewFailureRestore = originalGenerateMapOnLoad;
      w.generateMapOnLoad = async () => {
        w.seed = "topbar-new-failure-seed";
        if (w.mapName) w.mapName.value = "Topbar New Failure Map";
        w.mapId = ((w.mapId as number) || Date.now()) + 1;
        throw new Error("topbar new aborted");
      };
    });

    await topbarNew.click();
    await expect(projectDocumentPanel).toContainText("Topbar New Failure Map");
    await expect(projectDocumentPanel).toContainText("topbar-new-failure-seed");
    await expect(workspacePanel).toContainText("Available");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(seedRow).toContainText("topbar-new-failure-seed");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioTopbarNewFailureRestore) {
        w.generateMapOnLoad = w.__studioTopbarNewFailureRestore;
        delete w.__studioTopbarNewFailureRestore;
      }
      localStorage.removeItem("lastMap");
    });
  });

  test("writes back topbar open-file selections into Project and Data summaries", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const topbarOpen = page.locator("[data-studio-action='topbar'][data-value='open']").first();
    const initialMapId = await page.evaluate(() => (window as any).mapId);
    const mapFilePath = path.join(__dirname, "../fixtures/demo.map");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "topbar-open-dirty-seed";
      if (w.mapName) w.mapName.value = "Topbar Open Dirty Map";
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    await expect(dirtyRow).toContainText("Yes");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      topbarOpen.click(),
    ]);
    await fileChooser.setFiles(mapFilePath);

    await page.waitForFunction(previousMapId => (window as any).mapId !== previousMapId, initialMapId, {timeout: 120000});
    await page.waitForTimeout(500);

    const legacyDocument = await page.evaluate(() => ({
      name: (window as any).mapName?.value || "",
      seed: (window as any).seed || (window as any).optionsSeed?.value || "",
      hasSnapshot: Boolean(localStorage.getItem("lastMap") || sessionStorage.getItem("lastMap")),
    }));

    await expect(dirtyRow).toContainText("No");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText(legacyDocument.seed);
    await expect(dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/})).toContainText(
      legacyDocument.hasSnapshot ? "Available" : "None",
    );

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    await expect(projectDocumentPanel).toContainText(legacyDocument.name);
    await expect(projectDocumentPanel).toContainText(legacyDocument.seed);
  });

  test("keeps topbar open-file cancel path from mutating Project and Data summaries", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const topbarOpen = page.locator("[data-studio-action='topbar'][data-value='open']").first();

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "topbar-open-baseline";
      if (w.mapName) w.mapName.value = "Topbar Open Baseline";
      localStorage.setItem("lastMap", JSON.stringify({id: "topbar-open-baseline"}));
    });

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(seedRow).toContainText("topbar-open-baseline");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);
      w.__studioTopbarOpenCancelRestore = {fileInput, click: originalFileInputClick};
      w.__studioTopbarOpenCancelClicks = 0;
      if (fileInput) {
        fileInput.click = () => {
          w.__studioTopbarOpenCancelClicks += 1;
        };
      }
    });

    await topbarOpen.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioTopbarOpenCancelClicks)).toBe(1);
    await expect(seedRow).toContainText("topbar-open-baseline");
    await expect(snapshotRow).toContainText("Available");

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    await expect(projectDocumentPanel).toContainText("Topbar Open Baseline");
    await expect(projectDocumentPanel).toContainText("topbar-open-baseline");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioTopbarOpenCancelRestore;
      if (!restore) return;
      if (restore.fileInput && restore.click) restore.fileInput.click = restore.click;
      localStorage.removeItem("lastMap");
      delete w.__studioTopbarOpenCancelClicks;
      delete w.__studioTopbarOpenCancelRestore;
    });
  });

  test("routes Project quick actions through the Studio shell", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const quickActionsPanel = projectGeneratePanel(page);
    await expect(quickActionsPanel.getByRole("button", {name: "Generate from current settings"})).toBeVisible();
    await expect(quickActionsPanel.getByRole("button", {name: "Open file"})).toBeVisible();
    await expect(quickActionsPanel.getByRole("button", {name: "Save copy"})).toBeVisible();

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);

      w.__studioProjectQuickActionCalls = [];
      w.__studioProjectQuickActionRestore = {
        generateMapOnLoad: w.generateMapOnLoad,
        saveMap: w.saveMap,
        fileInput,
        fileInputClick: originalFileInputClick,
      };

      w.generateMapOnLoad = async () => {
        w.__studioProjectQuickActionCalls.push("new-map");
      };
      w.saveMap = async (target: string) => {
        w.__studioProjectQuickActionCalls.push(`save:${target}`);
      };
      if (fileInput) {
        fileInput.click = () => {
          w.__studioProjectQuickActionCalls.push("open-file");
        };
      }
    });

    await quickActionsPanel.getByRole("button", {name: "Generate from current settings"}).click();
    await quickActionsPanel.getByRole("button", {name: "Open file"}).click();
    await quickActionsPanel.getByRole("button", {name: "Save copy"}).click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectQuickActionCalls)).toEqual([
      "new-map",
      "open-file",
      "save:machine",
    ]);

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectQuickActionRestore;
      if (!restore) return;

      w.generateMapOnLoad = restore.generateMapOnLoad;
      w.saveMap = restore.saveMap;
      if (restore.fileInput && restore.fileInputClick) {
        restore.fileInput.click = restore.fileInputClick;
      }
      delete w.__studioProjectQuickActionCalls;
      delete w.__studioProjectQuickActionRestore;
    });
  });

  test("keeps Project quick action availability aligned with topbar actions", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const quickActionsPanel = projectGeneratePanel(page);
    const topbarNew = page.locator("[data-studio-action='topbar'][data-value='new']").first();
    const topbarOpen = page.locator("[data-studio-action='topbar'][data-value='open']").first();
    const topbarSave = page.locator("[data-studio-action='topbar'][data-value='save']").first();

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      w.__studioProjectQuickActionAvailabilityRestore = {
        generateMapOnLoad: w.generateMapOnLoad,
        saveMap: w.saveMap,
        fileInput,
      };
      w.generateMapOnLoad = undefined;
      w.saveMap = undefined;
      if (fileInput) fileInput.remove();
    });

    await projectNav.click();

    await expect(topbarNew).toBeDisabled();
    await expect(topbarOpen).toBeDisabled();
    await expect(topbarSave).toBeDisabled();
    await expect(quickActionsPanel.getByRole("button", {name: "Generate from current settings"})).toBeDisabled();
    await expect(quickActionsPanel.getByRole("button", {name: "Open file"})).toBeDisabled();
    await expect(quickActionsPanel.getByRole("button", {name: "Save copy"})).toBeDisabled();

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectQuickActionAvailabilityRestore;
      if (!restore) return;
      w.generateMapOnLoad = restore.generateMapOnLoad;
      w.saveMap = restore.saveMap;
      if (restore.fileInput && !document.getElementById("mapToLoad")) {
        document.body.appendChild(restore.fileInput);
      }
      delete w.__studioProjectQuickActionAvailabilityRestore;
    });
  });

  test("keeps document state consistent after Project save copy and new map quick actions", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const quickActionsPanel = projectGeneratePanel(page);

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "project-save-dirty-seed";
      if (w.mapName) w.mapName.value = "Project Save Dirty Map";
    });

    await dataNav.click();
    const dirtyRow = page.locator(".studio-sidebar--right .studio-panel").first().locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    await expect(dirtyRow).toContainText("Yes");

    await page.evaluate(() => {
      const w = window as any;
      w.__studioProjectDocumentRestore = {
        saveMap: w.saveMap,
        generateMapOnLoad: w.generateMapOnLoad,
      };

      w.saveMap = async () => {};
      w.generateMapOnLoad = async () => {
        w.seed = "project-new-seed";
        if (w.mapName) w.mapName.value = "Project New Map";
        w.mapId = ((w.mapId as number) || Date.now()) + 1;
      };
    });

    await projectNav.click();
    await quickActionsPanel.getByRole("button", {name: "Save copy"}).click();
    await dataNav.click();
    await expect(dirtyRow).toContainText("No");

    await projectNav.click();
    await quickActionsPanel.getByRole("button", {name: "Generate from current settings"}).click();
    await expect(projectDocumentPanel).toContainText("Project New Map");
    await expect(projectDocumentPanel).toContainText("project-new-seed");

    await dataNav.click();
    await expect(dirtyRow).toContainText("No");
    await expect(page.locator(".studio-sidebar--right .studio-panel").first().locator(".studio-kv").filter({hasText: "Seed"})).toContainText("project-new-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectDocumentRestore;
      if (!restore) return;

      w.saveMap = restore.saveMap;
      w.generateMapOnLoad = restore.generateMapOnLoad;
      delete w.__studioProjectDocumentRestore;
    });
  });

  test("applies generation profile defaults before generating a new map", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const generateButton = page.locator("[data-studio-action='topbar'][data-value='new']").last();

    await expect(page.locator(".studio-brand")).toHaveAttribute("title", "AGM Studio — Atlas Generation Matrix");
    await expect(page.locator(".studio-brand__logo")).toHaveAttribute("src", /agm-brand\/themes\/night\/AGM_STUDIO_app_icon_1024\.png/);
    await expect(page.locator(".studio-brand__logo")).toHaveAttribute("alt", "");
    await expect(page.locator("#loading")).toHaveCount(0);
    await expect(page.locator("#mapOverlay")).not.toBeVisible();
    await expect(page.locator("#dialogs")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator(".studio-sidebar--right")).toContainText("Advanced generation settings");
    await expect(page.locator(".studio-sidebar--right")).toContainText("Generate from current settings");
    await expect(page.locator(".studio-sidebar--right")).not.toContainText("Export AGM World JSON");
    await expect(page.locator(".studio-sidebar--right")).toContainText("Generate from current settings applies the selected profile's effective parameters before map creation.");

    await projectDocumentPanel.locator("#studioProjectGameProfileSelect").selectOption("strategy");

    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        const suggestions = draft.playability.generatorProfileSuggestions as {profile: string; parameterDraft: {key: string; value: number}}[];
        return Object.fromEntries(suggestions.filter(suggestion => suggestion.profile === "strategy").map(suggestion => [suggestion.parameterDraft.key, suggestion.parameterDraft.value])) as Record<string, number>;
      }),
    ).toMatchObject({
      spawnFairnessWeight: expect.any(Number),
      settlementDensityTarget: expect.any(Number),
      resourceCoverageTarget: expect.any(Number),
      routeConnectivityScore: expect.any(Number),
    });
    const defaultParameters = await page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
      const draft = JSON.parse(text || "{}");
      const suggestions = draft.playability.generatorProfileSuggestions as {profile: string; parameterDraft: {key: string; value: number}}[];
      return Object.fromEntries(suggestions.filter(suggestion => suggestion.profile === "strategy").map(suggestion => [suggestion.parameterDraft.key, suggestion.parameterDraft.value])) as Record<string, number>;
    });
    const pendingStatesBeforeGenerate = await page.evaluate(() => (document.getElementById("statesNumber") as HTMLInputElement | null)?.value || "1");
    const expectedDefaults = {
      states: String(Math.round(defaultParameters.spawnFairnessWeight * 10)),
      burgs: String(Math.round(defaultParameters.settlementDensityTarget * Number(pendingStatesBeforeGenerate || 1))),
      provincesRatio: String(defaultParameters.resourceCoverageTarget),
      growthRate: String(defaultParameters.routeConnectivityScore / 50),
    };

    await page.evaluate(() => {
      const w = window as any;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      w.__studioProfileDefaultGenerateCalls = [];
      w.__studioProfileDefaultGenerateRestore = originalGenerateMapOnLoad;
      w.generateMapOnLoad = async () => {
        w.__studioProfileDefaultGenerateCalls.push({
          states: (document.getElementById("statesNumber") as HTMLInputElement | null)?.value,
          burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value,
          provincesRatio: (document.getElementById("provincesRatio") as HTMLInputElement | null)?.value,
          growthRate: (document.getElementById("growthRate") as HTMLInputElement | null)?.value,
        });
      };
    });

    await generateButton.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProfileDefaultGenerateCalls)).toEqual([
      expectedDefaults,
    ]);
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("Profile generation impact");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("Applied strategy profile parameters before generation.");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("spawnFairnessWeight → states");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("settlementDensityTarget → burgs");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("routeConnectivityScore → growthRate");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("resourceCoverageTarget → provincesRatio");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("Result metrics");
    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        return draft.playability.generationProfileImpact;
      }),
    ).toMatchObject({
      profile: "strategy",
      appliedAt: expect.any(Number),
      changes: expect.arrayContaining([
        expect.objectContaining({key: "spawnFairnessWeight", target: "states", after: Number(expectedDefaults.states)}),
        expect.objectContaining({key: "settlementDensityTarget", target: "burgs", after: Number(expectedDefaults.burgs)}),
        expect.objectContaining({key: "routeConnectivityScore", target: "growthRate", after: Number(expectedDefaults.growthRate)}),
        expect.objectContaining({key: "resourceCoverageTarget", target: "provincesRatio", after: Number(expectedDefaults.provincesRatio)}),
      ]),
      resultMetrics: expect.arrayContaining([
        expect.objectContaining({key: "spawnCandidates", before: expect.any(Number), after: expect.any(Number), delta: expect.any(Number)}),
      ]),
    });

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProfileDefaultGenerateRestore) {
        w.generateMapOnLoad = w.__studioProfileDefaultGenerateRestore;
        delete w.__studioProfileDefaultGenerateRestore;
      }
      delete w.__studioProfileDefaultGenerateCalls;
    });
  });

  test("applies generation profile overrides before generating a new map", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const generateButton = page.locator("[data-studio-action='topbar'][data-value='new']").last();

    await projectDocumentPanel.locator("#studioProjectGameProfileSelect").selectOption("strategy");
    await fillGeneratorParameter(page, "spawnFairnessWeight", "2.4");
    await fillGeneratorParameter(page, "routeConnectivityScore", "90");
    await fillGeneratorParameter(page, "settlementDensityTarget", "8");
    await fillGeneratorParameter(page, "resourceCoverageTarget", "72");

    await page.evaluate(() => {
      const w = window as any;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      w.__studioProfileOverrideGenerateCalls = [];
      w.__studioProfileOverrideGenerateRestore = originalGenerateMapOnLoad;
      w.generateMapOnLoad = async () => {
        w.__studioProfileOverrideGenerateCalls.push({
          states: (document.getElementById("statesNumber") as HTMLInputElement | null)?.value,
          burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value,
          provincesRatio: (document.getElementById("provincesRatio") as HTMLInputElement | null)?.value,
          growthRate: (document.getElementById("growthRate") as HTMLInputElement | null)?.value,
        });
      };
    });

    await generateButton.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProfileOverrideGenerateCalls)).toEqual([
      {states: "24", burgs: "136", provincesRatio: "72", growthRate: "1.8"},
    ]);
    await expect.poll(() => page.evaluate(() => ({
      states: (document.getElementById("statesNumber") as HTMLInputElement | null)?.value,
      burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value,
      provincesRatio: (document.getElementById("provincesRatio") as HTMLInputElement | null)?.value,
      growthRate: (document.getElementById("growthRate") as HTMLInputElement | null)?.value,
    }))).toEqual({states: "24", burgs: "136", provincesRatio: "72", growthRate: "1.8"});
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("Profile generation impact");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("spawnFairnessWeight → states");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("settlementDensityTarget → burgs");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("routeConnectivityScore → growthRate");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("resourceCoverageTarget → provincesRatio");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("Result metrics");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("spawnCandidates");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("averageSpawnScore");
    await expect(page.locator("#studioGenerationProfileImpact")).toContainText("routes");
    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        return draft.playability.generationProfileImpact;
      }),
    ).toMatchObject({
      profile: "strategy",
      appliedAt: expect.any(Number),
      changes: expect.arrayContaining([
        expect.objectContaining({key: "spawnFairnessWeight", target: "states", after: 24}),
        expect.objectContaining({key: "settlementDensityTarget", target: "burgs", after: 136}),
        expect.objectContaining({key: "routeConnectivityScore", target: "growthRate", after: 1.8}),
        expect.objectContaining({key: "resourceCoverageTarget", target: "provincesRatio", after: 72}),
      ]),
      resultMetrics: expect.arrayContaining([
        expect.objectContaining({key: "spawnCandidates", before: expect.any(Number), after: expect.any(Number), delta: expect.any(Number)}),
        expect.objectContaining({key: "averageSpawnScore", before: expect.any(Number), after: expect.any(Number), delta: expect.any(Number)}),
        expect.objectContaining({key: "routes", before: expect.any(Number), after: expect.any(Number), delta: expect.any(Number)}),
      ]),
    });

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProfileOverrideGenerateRestore) {
        w.generateMapOnLoad = w.__studioProfileOverrideGenerateRestore;
        delete w.__studioProfileOverrideGenerateRestore;
      }
      delete w.__studioProfileOverrideGenerateCalls;
    });
  });

  test("generates a new map from current Project workspace settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const generateButton = workspacePanel.getByRole("button", {name: "Generate map"});

    await workspacePanel.locator("#studioProjectSeedInput").fill("424242");
    await workspacePanel.locator("#studioProjectSeedInput").blur();
    await workspacePanel.locator("#studioProjectStatesInput").fill("22");
    await workspacePanel.locator("#studioProjectStatesInput").blur();
    await workspacePanel.locator("#studioProjectProvincesRatioInput").fill("38");
    await workspacePanel.locator("#studioProjectProvincesRatioInput").blur();
    await workspacePanel.locator("#studioProjectGrowthRateInput").fill("1.6");
    await workspacePanel.locator("#studioProjectGrowthRateInput").blur();
    await workspacePanel.locator("#studioProjectSizeVarietyInput").fill("6.4");
    await workspacePanel.locator("#studioProjectSizeVarietyInput").blur();
    await workspacePanel.locator("#studioProjectBurgsInput").fill("1000");
    await workspacePanel.locator("#studioProjectBurgsInput").blur();
    await workspacePanel.locator("#studioProjectReligionsInput").fill("12");
    await workspacePanel.locator("#studioProjectReligionsInput").blur();
    await workspacePanel.locator("#studioProjectWidthInput").fill("1666");
    await workspacePanel.locator("#studioProjectWidthInput").blur();
    await workspacePanel.locator("#studioProjectHeightInput").fill("944");
    await workspacePanel.locator("#studioProjectHeightInput").blur();

    await page.evaluate(() => {
      const w = window as any;
      const originalGenerateMapOnLoad = w.generateMapOnLoad;
      w.__studioProjectGenerateCalls = [];
      w.__studioProjectGenerateRestore = originalGenerateMapOnLoad;
      w.generateMapOnLoad = async () => {
        w.__studioProjectGenerateCalls.push({
          seed: (document.getElementById("optionsSeed") as HTMLInputElement | null)?.value,
          states: (document.getElementById("statesNumber") as HTMLInputElement | null)?.value,
          provincesRatio: (document.getElementById("provincesRatio") as HTMLInputElement | null)?.value,
          growthRate: (document.getElementById("growthRate") as HTMLInputElement | null)?.value,
          sizeVariety: (document.getElementById("sizeVariety") as HTMLInputElement | null)?.value,
          burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value,
          burgsLabel:
            (document.getElementById("manorsOutput") as HTMLOutputElement | null)?.value ||
            (document.getElementById("manorsOutput") as HTMLOutputElement | null)?.textContent?.trim() || "",
          religions: (document.getElementById("religionsNumber") as HTMLInputElement | null)?.value,
          width: (document.getElementById("mapWidthInput") as HTMLInputElement | null)?.value,
          height: (document.getElementById("mapHeightInput") as HTMLInputElement | null)?.value,
        });
      };
    });

    await generateButton.click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectGenerateCalls)).toEqual([
      {seed: "424242", states: "22", provincesRatio: "38", growthRate: "2", sizeVariety: "5.5", burgs: "286", burgsLabel: "286", religions: "12", width: "1666", height: "944"},
    ]);

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProjectGenerateRestore) {
        w.generateMapOnLoad = w.__studioProjectGenerateRestore;
        delete w.__studioProjectGenerateRestore;
      }
      delete w.__studioProjectGenerateCalls;
    });
  });

  test("writes back document state after selecting a map via Project Open file quick action", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const quickActionsPanel = projectGeneratePanel(page);
    const initialMapId = await page.evaluate(() => (window as any).mapId);
    const mapFilePath = path.join(__dirname, "../fixtures/demo.map");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "project-open-dirty-seed";
      if (w.mapName) w.mapName.value = "Project Open Dirty Map";
    });

    await dataNav.click();
    const dirtyRow = page.locator(".studio-sidebar--right .studio-panel").first().locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    await expect(dirtyRow).toContainText("Yes");

    await projectNav.click();
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      quickActionsPanel.getByRole("button", {name: "Open file"}).click(),
    ]);
    await fileChooser.setFiles(mapFilePath);

    await page.waitForFunction(previousMapId => (window as any).mapId !== previousMapId, initialMapId, {timeout: 120000});
    await page.waitForTimeout(500);

    const legacyDocument = await page.evaluate(() => ({
      name: (window as any).mapName?.value || "",
      seed: (window as any).seed || (window as any).optionsSeed?.value || "",
      hasSnapshot: Boolean(localStorage.getItem("lastMap") || sessionStorage.getItem("lastMap")),
    }));

    await expect(projectDocumentPanel).toContainText(legacyDocument.name);
    await expect(projectDocumentPanel).toContainText(legacyDocument.seed);

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect(dirtyRow).toContainText("No");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText(legacyDocument.seed);
    await expect(dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/})).toContainText(
      legacyDocument.hasSnapshot ? "Available" : "None",
    );
  });

  test("keeps Project save copy failure aligned with dirty and snapshot state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "project-save-failure-seed";
      if (w.mapName) w.mapName.value = "Project Save Failure Map";
      localStorage.removeItem("lastMap");
    });

    await projectNav.click();
    const quickActionsPanel = projectGeneratePanel(page);

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("None");

    await page.evaluate(() => {
      const w = window as any;
      const originalSaveMap = w.saveMap;
      w.__studioProjectSaveFailureRestore = originalSaveMap;
      w.saveMap = async (target: string) => {
        if (target === "machine") {
          localStorage.setItem("lastMap", JSON.stringify({id: "project-save-failure"}));
          throw new Error("project save aborted");
        }
        return originalSaveMap?.(target);
      };
    });

    await projectNav.click();
    await quickActionsPanel.getByRole("button", {name: "Save copy"}).click();
    await dataNav.click();

    await expect(dirtyRow).toContainText("Yes");
    await expect(snapshotRow).toContainText("Available");
    await expect(dataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText("project-save-failure-seed");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProjectSaveFailureRestore) {
        w.saveMap = w.__studioProjectSaveFailureRestore;
        delete w.__studioProjectSaveFailureRestore;
      }
      localStorage.removeItem("lastMap");
    });
  });

  test("keeps Project open-file cancel path aligned with document and dirty state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "project-open-cancel-baseline";
      if (w.mapName) w.mapName.value = "Project Open Cancel Baseline";
      w.mapId = ((w.mapId as number) || Date.now()) + 1;
      localStorage.setItem("lastMap", JSON.stringify({id: "project-open-cancel"}));
    });

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const quickActionsPanel = projectGeneratePanel(page);

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);
      w.__studioProjectOpenCancelRestore = {fileInput, click: originalFileInputClick};
      w.__studioProjectOpenCancelClicks = 0;
      if (fileInput) {
        fileInput.click = () => {
          w.__studioProjectOpenCancelClicks += 1;
        };
      }
    });

    await quickActionsPanel.getByRole("button", {name: "Open file"}).click();
    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectOpenCancelClicks)).toBe(1);
    await expect(projectDocumentPanel).toContainText("Project Open Cancel Baseline");
    await expect(projectDocumentPanel).toContainText("project-open-cancel-baseline");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("No");
    await expect(seedRow).toContainText("project-open-cancel-baseline");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectOpenCancelRestore;
      if (!restore) return;
      if (restore.fileInput && restore.click) restore.fileInput.click = restore.click;
      localStorage.removeItem("lastMap");
      delete w.__studioProjectOpenCancelClicks;
      delete w.__studioProjectOpenCancelRestore;
    });
  });

  test("re-syncs Project open-file failure when legacy metadata mutates before cancel", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await projectNav.click();
    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const quickActionsPanel = projectGeneratePanel(page);

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);
      w.__studioProjectOpenFailureRestore = {fileInput, click: originalFileInputClick};
      if (fileInput) {
        fileInput.click = () => {
          w.seed = "project-open-failure-seed";
          if (w.mapName) w.mapName.value = "Project Open Failure Map";
          localStorage.setItem("lastMap", JSON.stringify({id: "project-open-failure"}));
          throw new Error("project picker canceled");
        };
      }
    });

    await quickActionsPanel.getByRole("button", {name: "Open file"}).click();
    await expect(projectDocumentPanel).toContainText("Project Open Failure Map");
    await expect(projectDocumentPanel).toContainText("project-open-failure-seed");

    await dataNav.click();
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    await expect(dirtyRow).toContainText("Yes");
    await expect(seedRow).toContainText("project-open-failure-seed");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioProjectOpenFailureRestore;
      if (!restore) return;
      if (restore.fileInput && restore.click) restore.fileInput.click = restore.click;
      localStorage.removeItem("lastMap");
      delete w.__studioProjectOpenFailureRestore;
    });
  });

  test("keeps Project document summary aligned for size and style changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);

    await page.evaluate(() => {
      const w = window as any;
      w.graphWidth = 2048;
      w.graphHeight = 1536;
      if (w.mapWidthInput) w.mapWidthInput.value = "2048";
      if (w.mapHeightInput) w.mapHeightInput.value = "1536";
      localStorage.setItem("presetStyle", "clean");
      if (w.stylePreset) w.stylePreset.value = "clean";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(projectDocumentPanel).toContainText("2048 × 1536");
    await expect(projectDocumentPanel).toContainText("clean");
  });

  test("writes Project document name through AGM document state into legacy metadata", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");

    await nameInput.fill("AGM Named Draft");
    await nameInput.blur();

    await expect.poll(() => page.evaluate(() => (window as any).mapName?.value || "")).toBe("AGM Named Draft");
    await expect(projectDocumentPanel).toContainText("AGM Named Draft");
    await expect(projectDocumentPanel).toContainText("Document sourceAGM Studio");

    await page.evaluate(() => {
      const w = window as any;
      if (w.mapName) w.mapName.value = "Legacy Drift Name";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(nameInput).toHaveValue("AGM Named Draft");
    await expect(projectDocumentPanel).toContainText("AGM Named Draft");
  });

  test("keeps Project game profile and design intent in AGM document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const designIntent = "Cold continent, three rival kingdoms, scarce trade routes, mountain-focused resources";

    await gameProfileSelect.selectOption("4x");
    await designIntentInput.fill(designIntent);
    await designIntentInput.blur();

    await expect(projectDocumentPanel).toContainText("4X civilization map");
    await expect(projectDocumentPanel).toContainText("Document sourceAGM Studio");

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(gameProfileSelect).toHaveValue("4x");
    await expect(designIntentInput).toHaveValue(designIntent);
    await expect(projectDocumentPanel).toContainText("4X civilization map");
  });

  test("renders a minimal Project world json draft from AGM document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const worldJsonDraft = page.locator("#studioProjectWorldJsonDraft");
    const designIntent = "Open-world frontier with volcanic highlands, coastal trade, and faction conflict";

    await nameInput.fill("AGM World Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("open-world");
    await designIntentInput.fill(designIntent);
    await designIntentInput.blur();

    await expect(worldJsonDraft).toContainText('"schema": "agm.world.v0"');
    await expect(worldJsonDraft).toContainText('"name": "AGM World Draft"');
    await expect(worldJsonDraft).toContainText('"source": "agm"');
    await expect(worldJsonDraft).toContainText('"profile": "open-world"');
    await expect(worldJsonDraft).toContainText('"profileLabel": "Open world region"');
    await expect(worldJsonDraft).toContainText(`"designIntent": "${designIntent}"`);
    await expect(worldJsonDraft).toContainText('"width": 1280');
    await expect(worldJsonDraft).toContainText('"height": 720');
    await expect(worldJsonDraft).toContainText('"format": "png"');
  });

  test("renders real legacy world summary fields in the Project world json draft", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const worldJsonDraft = page.locator("#studioProjectWorldJsonDraft");
    const statesInput = page.locator("#studioProjectStatesInput");
    const precipitationInput = page.locator("#studioProjectPrecipitationInput");
    const culturesInput = page.locator("#studioProjectCulturesInput");
    const burgsInput = page.locator("#studioProjectBurgsInput");
    const religionsInput = page.locator("#studioProjectReligionsInput");

    await statesInput.fill("18");
    await statesInput.blur();
    await precipitationInput.fill("145");
    await precipitationInput.blur();
    await culturesInput.fill("9");
    await culturesInput.blur();
    await burgsInput.fill("72");
    await burgsInput.blur();
    await religionsInput.fill("4");
    await religionsInput.blur();

    await expect(worldJsonDraft).toContainText('"generation"');
    await expect(worldJsonDraft).toContainText('"states": 18');
    await expect(worldJsonDraft).toContainText('"climate"');
    await expect(worldJsonDraft).toContainText('"precipitation": 145');
    await expect(worldJsonDraft).toContainText('"population"');
    await expect(worldJsonDraft).toContainText('"cultures": 9');
    await expect(worldJsonDraft).toContainText('"burgs": 72');
    await expect(worldJsonDraft).toContainText('"religions": 4');
    await expect(worldJsonDraft).toContainText('"winds"');
  });

  test("renders a visible AGM balance checker from playability hints", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const balanceChecker = await openBalanceChecker(page);
    await expect(balanceChecker).toContainText("AGM Balance Checker");
    await expect(balanceChecker).toContainText("Spawn candidates");
    await expect(balanceChecker).toContainText("Balance hints");
    await expect(balanceChecker).toContainText("Auto-fix drafts");
    await expect(balanceChecker).toContainText("Applied previews");
    await expect(balanceChecker).toContainText("Discarded previews");
    await expect(balanceChecker).toContainText("Top spawn score");
    await expect(balanceChecker).toContainText("Spawn drill-down");
    await expect(balanceChecker).toContainText("Balance hint drill-down");
    await expect(balanceChecker).toContainText("AGM auto-fix drafts");
    await expect(balanceChecker).toContainText("Suggested steps");
    await expect(balanceChecker).toContainText("Risks");
    await expect(balanceChecker).toContainText("Dry-run preview diff");
    await expect(balanceChecker).toContainText("dry-run");
    await expect(balanceChecker).toContainText(/Settlement density preview|Route connector preview/);
    await expect(balanceChecker).toContainText(/create burg|link route/);
    await expect(balanceChecker).toContainText(/planned changes/);
    await expect(balanceChecker).toContainText("Apply preview");
    await expect(balanceChecker).toContainText("Discard preview");
    await expect(balanceChecker).toContainText("Undo preview");
    await expect(balanceChecker).toContainText("Redo preview");
    await expect(balanceChecker).toContainText("Preview status");
    await expect(balanceChecker).toContainText(/spawn-support|sparse-state-support|extend-existing-route-group|create-first-route-group/);
    await expect(balanceChecker).toContainText(/expand-spawn-candidate-set|rebalance-settlement-density|draft-route-connectors|tune-habitable-biome-weights/);
    await expect(balanceChecker).toContainText(/state:|province:/);
    await expect(balanceChecker).toContainText("Focus");
    await expect(balanceChecker).toContainText(/Focus state|Focus province|Focus burg|Focus biome/);
    await expect(balanceChecker).toContainText(/Fix state|Fix province|Fix burg|Fix biome/);
    await expect(balanceChecker).toContainText(/Adjust state|Adjust province/);
    await expect(balanceChecker.getByRole("button", {name: /Open States editor|Open Provinces editor|Open Biomes editor|Review spawn region/}).first()).toBeVisible();
    await expect(balanceChecker).toContainText(/candidate spawn regions|Fewer than four candidate spawn regions/);
  });

  test("applies, discards, undoes and redoes AGM auto-fix preview diffs", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const balanceChecker = await openBalanceChecker(page);
    const spawnCard = balanceChecker.locator("[data-auto-fix-draft-id='auto-fix-spawn-candidate-coverage']");
    const settlementCard = balanceChecker.locator("[data-auto-fix-draft-id='auto-fix-settlement-distribution']");
    const routeCard = balanceChecker.locator("[data-auto-fix-draft-id='auto-fix-route-connectivity']");

    await expect(spawnCard).toHaveAttribute("data-preview-status", "pending");
    await expect(settlementCard).toHaveAttribute("data-preview-status", "pending");
    await expect(routeCard).toHaveAttribute("data-preview-status", "pending");
    await expect(balanceChecker).toContainText("Applied previews0");
    await expect(balanceChecker).toContainText("Applied changes0");
    await expect(balanceChecker).toContainText("Discarded previews0");
    await expect(balanceChecker).toContainText("Applied change queue: No pending changes to apply");
    await expect(balanceChecker).toContainText("History: No preview changes applied");

    const initialStateFairStart = await page.evaluate(() => {
      const state = (window as any).pack.states.find((item: any) => item?.i && !item.removed);
      return {stateId: state.i, agmFairStart: state.agmFairStart, agmFairStartScore: state.agmFairStartScore, agmPriority: state.agmPriority};
    });

    await clickAutoFixDraftButton(page, "auto-fix-spawn-candidate-coverage", "Apply preview");
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmFairStart, initialStateFairStart))
      .toBe(true);
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmFairStartScore, initialStateFairStart))
      .toEqual(expect.any(Number));
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmPriority, initialStateFairStart))
      .toMatch(/^(primary|secondary)-start$/);
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-spawn-candidate-coverage']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews1");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-spawn-candidate-coverage");

    await clickAutoFixHistory(page, "undo");
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmFairStart, initialStateFairStart))
      .toBe(initialStateFairStart.agmFairStart);
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmFairStartScore, initialStateFairStart))
      .toBe(initialStateFairStart.agmFairStartScore);
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmPriority, initialStateFairStart))
      .toBe(initialStateFairStart.agmPriority);
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-spawn-candidate-coverage']")).toHaveAttribute("data-preview-status", "pending");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews0");

    await clickAutoFixHistory(page, "redo");
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmFairStart, initialStateFairStart))
      .toBe(true);
    await expect
      .poll(() => page.evaluate(({stateId}) => (window as any).pack.states[stateId].agmPriority, initialStateFairStart))
      .toMatch(/^(primary|secondary)-start$/);
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-spawn-candidate-coverage']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews1");

    const initialBurgCount = await page.evaluate(() => (window as any).pack.burgs.filter((burg: any) => burg?.i && !burg.removed).length);

    await clickAutoFixDraftButton(page, "auto-fix-settlement-distribution", "Apply preview");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.burgs.filter((burg: any) => burg?.i && !burg.removed).length))
      .toBeGreaterThan(initialBurgCount);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const burg = (window as any).pack.burgs.find((item: any) => item?.i && !item.removed && item.agmRole === "support-settlement");
          return burg ? {agmRole: burg.agmRole, agmPriority: burg.agmPriority, agmSupportState: burg.agmSupportState} : null;
        }),
      )
      .toEqual(expect.objectContaining({agmRole: "support-settlement", agmPriority: expect.stringMatching(/^(spawn|sparse-state)-support$/), agmSupportState: expect.any(Number)}));
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-settlement-distribution']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews2");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied changes");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-spawn-candidate-coverage");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-settlement-distribution");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("History: apply auto-fix-settlement-distribution");

    await clickAutoFixHistory(page, "undo");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.burgs.filter((burg: any) => burg?.i && !burg.removed).length))
      .toBe(initialBurgCount);
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-settlement-distribution']")).toHaveAttribute("data-preview-status", "pending");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews1");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-spawn-candidate-coverage");

    await clickAutoFixHistory(page, "redo");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.burgs.filter((burg: any) => burg?.i && !burg.removed).length))
      .toBeGreaterThan(initialBurgCount);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const burg = (window as any).pack.burgs.find((item: any) => item?.i && !item.removed && item.agmRole === "support-settlement");
          return burg ? {agmRole: burg.agmRole, agmPriority: burg.agmPriority, agmSupportState: burg.agmSupportState} : null;
        }),
      )
      .toEqual(expect.objectContaining({agmRole: "support-settlement", agmPriority: expect.stringMatching(/^(spawn|sparse-state)-support$/), agmSupportState: expect.any(Number)}));
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-settlement-distribution']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews2");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-spawn-candidate-coverage");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-settlement-distribution");

    const initialRouteCount = await page.evaluate(() => (window as any).pack.routes.length);
    const initialProvinceConnector = await page.evaluate(() => {
      const change = JSON.parse(document.querySelector("#studioProjectWorldJsonDraft")?.textContent || "{}").playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-route-connectivity").previewDiff.changes[0];
      const provinceId = change.fields.fromProvince;
      const province = (window as any).pack.provinces[provinceId];
      return {provinceId, agmConnectorTarget: province.agmConnectorTarget, agmConnectorType: province.agmConnectorType};
    });

    await clickAutoFixDraftButton(page, "auto-fix-route-connectivity", "Apply preview");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.routes.length))
      .toBeGreaterThan(initialRouteCount);
    await expect
      .poll(() => page.evaluate(({provinceId}) => {
        const province = (window as any).pack.provinces[provinceId];
        return {agmConnectorTarget: province.agmConnectorTarget, agmConnectorType: province.agmConnectorType};
      }, initialProvinceConnector))
      .toEqual(expect.objectContaining({agmConnectorTarget: expect.any(Number), agmConnectorType: expect.any(String)}));
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-route-connectivity']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews3");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-spawn-candidate-coverage");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-settlement-distribution");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-route-connectivity");

    await clickAutoFixHistory(page, "undo");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.routes.length))
      .toBe(initialRouteCount);
    await expect
      .poll(() => page.evaluate(({provinceId}) => {
        const province = (window as any).pack.provinces[provinceId];
        return {agmConnectorTarget: province.agmConnectorTarget, agmConnectorType: province.agmConnectorType};
      }, initialProvinceConnector))
      .toEqual({agmConnectorTarget: initialProvinceConnector.agmConnectorTarget, agmConnectorType: initialProvinceConnector.agmConnectorType});
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-route-connectivity']")).toHaveAttribute("data-preview-status", "pending");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews2");

    await clickAutoFixHistory(page, "redo");
    await expect
      .poll(() => page.evaluate(() => (window as any).pack.routes.length))
      .toBeGreaterThan(initialRouteCount);
    await expect
      .poll(() => page.evaluate(({provinceId}) => {
        const province = (window as any).pack.provinces[provinceId];
        return {agmConnectorTarget: province.agmConnectorTarget, agmConnectorType: province.agmConnectorType};
      }, initialProvinceConnector))
      .toEqual(expect.objectContaining({agmConnectorTarget: expect.any(Number), agmConnectorType: expect.any(String)}));
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-route-connectivity']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews3");

    const initialBiomeHabitability = await page.evaluate(() => {
      const biomeId = (window as any).biomesData.i.find((id: number) => typeof (window as any).biomesData.habitability[id] === "number");
      return {
        biomeId,
        habitability: (window as any).biomesData.habitability[biomeId],
        agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId],
        agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId],
      };
    });

    await clickAutoFixDraftButton(page, "auto-fix-biome-habitability", "Apply preview");
    await expect
      .poll(() => page.evaluate(({biomeId}) => (window as any).biomesData.habitability[biomeId], initialBiomeHabitability))
      .toBeGreaterThan(initialBiomeHabitability.habitability);
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), initialBiomeHabitability))
      .toEqual({agmRuleWeight: expect.any(Number), agmResourceTag: expect.stringMatching(/^(starter|challenge)-biome$/)});
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-biome-habitability']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews4");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("auto-fix-biome-habitability");

    await clickAutoFixHistory(page, "undo");
    await expect
      .poll(() => page.evaluate(({biomeId}) => (window as any).biomesData.habitability[biomeId], initialBiomeHabitability))
      .toBe(initialBiomeHabitability.habitability);
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), initialBiomeHabitability))
      .toEqual({agmRuleWeight: initialBiomeHabitability.agmRuleWeight, agmResourceTag: initialBiomeHabitability.agmResourceTag});
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-biome-habitability']")).toHaveAttribute("data-preview-status", "pending");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews3");

    await clickAutoFixHistory(page, "redo");
    await expect
      .poll(() => page.evaluate(({biomeId}) => (window as any).biomesData.habitability[biomeId], initialBiomeHabitability))
      .toBeGreaterThan(initialBiomeHabitability.habitability);
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), initialBiomeHabitability))
      .toEqual({agmRuleWeight: expect.any(Number), agmResourceTag: expect.stringMatching(/^(starter|challenge)-biome$/)});
    await expect(page.locator("#studioBalanceCheckerPanel [data-auto-fix-draft-id='auto-fix-biome-habitability']")).toHaveAttribute("data-preview-status", "applied");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews4");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("AGM biome rule metadata");
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText(/rule weight: \d|resource tag: (starter|challenge)-biome/);

    const firstBiomeRuleCard = page.locator("#studioBalanceCheckerPanel [data-biome-rule-id]").first();
    const manualBiomeId = Number(await firstBiomeRuleCard.getAttribute("data-biome-rule-id"));
    const manualBiomeBefore = await page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), {biomeId: manualBiomeId});
    await setBiomeRule(page, manualBiomeId, "1.7", "neutral-biome");
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), {biomeId: manualBiomeId}))
      .toEqual({agmRuleWeight: 1.7, agmResourceTag: "neutral-biome"});
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText(`manual-biome-rule-${manualBiomeId}`);
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews5");

    await clickAutoFixHistory(page, "undo");
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), {biomeId: manualBiomeId}))
      .toEqual(manualBiomeBefore);
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews4");

    await clickAutoFixHistory(page, "redo");
    await expect
      .poll(() => page.evaluate(({biomeId}) => ({agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId], agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId]}), {biomeId: manualBiomeId}))
      .toEqual({agmRuleWeight: 1.7, agmResourceTag: "neutral-biome"});
    await expect(page.locator("#studioBalanceCheckerPanel")).toContainText("Applied previews5");

    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        const manualRule = draft.rules.biomeRules.find((rule: any) => rule.biomeId === manualBiomeId);
        const manualTag = draft.rules.resourceTags.find((tag: any) => tag.tag === "neutral-biome");
        return {schema: draft.rules.schema, manualRule, manualTag};
      }),
    ).toMatchObject({
      schema: "agm.rules.v0",
      manualRule: expect.objectContaining({biomeId: manualBiomeId, ruleWeight: expect.any(Number), resourceTag: "neutral-biome", source: "studio-metadata"}),
      manualTag: expect.objectContaining({tag: "neutral-biome", role: "neutral", biomeIds: expect.arrayContaining([manualBiomeId])}),
    });

    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        return draft.playability.appliedPreviewChanges;
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({draftId: "auto-fix-spawn-candidate-coverage", operation: "update", entity: "state", refs: expect.objectContaining({states: expect.any(Array)}), fields: expect.objectContaining({agmFairStart: true, agmFairStartScore: expect.any(Number), agmPriority: expect.stringMatching(/^(primary|secondary)-start$/)})}),
        expect.objectContaining({draftId: "auto-fix-settlement-distribution", operation: "create", entity: "burg", refs: expect.objectContaining({states: expect.any(Array)}), fields: expect.objectContaining({agmRole: "support-settlement", agmSupportState: expect.any(Number), priority: expect.stringMatching(/^(spawn|sparse-state)-support$/)})}),
        expect.objectContaining({draftId: "auto-fix-route-connectivity", operation: "link", entity: "route", refs: expect.objectContaining({provinces: expect.any(Array)}), fields: expect.objectContaining({fromProvince: expect.any(Number), toProvince: expect.any(Number), connectorType: expect.any(String)})}),
        expect.objectContaining({draftId: "auto-fix-biome-habitability", operation: "update", entity: "biome", refs: expect.objectContaining({biomes: expect.any(Array)}), fields: expect.objectContaining({habitability: expect.any(Number), previousHabitability: expect.any(Number), agmRuleWeight: expect.any(Number), agmResourceTag: expect.stringMatching(/^(starter|challenge)-biome$/)})}),
        expect.objectContaining({draftId: `manual-biome-rule-${manualBiomeId}`, operation: "update", entity: "biome", refs: expect.objectContaining({biomes: [manualBiomeId]}), fields: expect.objectContaining({agmRuleWeight: 1.7, agmResourceTag: "neutral-biome", tuningReason: "manual-biome-rule-adjustment"})}),
      ]),
    );
  });

  test("focuses a Balance Checker reference on the AGM canvas", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const balanceChecker = await openBalanceChecker(page);
    const focusButton = balanceChecker.locator("[data-studio-action='balance-focus']").first();
    const targetType = await focusButton.getAttribute("data-target-type");
    const targetId = await focusButton.getAttribute("data-target-id");

    await focusButton.click();

    await expect(page.locator("[data-studio-action='section'][data-value='canvas']")).toHaveClass(/is-active/);
    const focusOverlay = page.locator("#studioBalanceFocusOverlay");
    await expect(focusOverlay).toBeVisible();
    await expect(focusOverlay).toHaveAttribute("data-target-type", targetType || "");
    await expect(focusOverlay).toHaveAttribute("data-target-id", targetId || "");
    await expect(focusOverlay).toHaveAttribute("data-focus-action", "focus");
    await expect(focusOverlay).toHaveClass(/is-positioned/);
    await expect(focusOverlay.locator(".studio-balance-focus-overlay__outline")).toBeVisible();
    await expect(focusOverlay).toContainText(`AGM focus · ${targetType} ${targetId}`);
    await expect(focusOverlay).toContainText(/\d+\.\d%, \d+\.\d%/);
    const focusX = Number(await focusOverlay.getAttribute("data-focus-x"));
    const focusY = Number(await focusOverlay.getAttribute("data-focus-y"));
    expect(focusX).toBeGreaterThanOrEqual(0);
    expect(focusX).toBeLessThanOrEqual(100);
    expect(focusY).toBeGreaterThanOrEqual(0);
    expect(focusY).toBeLessThanOrEqual(100);
  });

  test("marks a Balance Checker fix target on the AGM canvas", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const balanceChecker = await openBalanceChecker(page);
    const fixButton = balanceChecker.locator("[data-focus-action='fix']").first();
    const targetType = await fixButton.getAttribute("data-target-type");
    const targetId = await fixButton.getAttribute("data-target-id");

    await fixButton.click();

    await expect(page.locator("[data-studio-action='section'][data-value='canvas']")).toHaveClass(/is-active/);
    const focusOverlay = page.locator("#studioBalanceFocusOverlay");
    await expect(focusOverlay).toBeVisible();
    await expect(focusOverlay).toHaveAttribute("data-target-type", targetType || "");
    await expect(focusOverlay).toHaveAttribute("data-target-id", targetId || "");
    await expect(focusOverlay).toHaveAttribute("data-focus-action", "fix");
    await expect(focusOverlay).toHaveClass(/is-fix/);
    await expect(focusOverlay.locator(".studio-balance-focus-overlay__outline")).toBeVisible();
    await expect(focusOverlay).toContainText(`AGM fix candidate · ${targetType} ${targetId}`);
  });

  test("saves and restores a minimal AGM draft from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const savedIntent = "Restore this tabletop campaign with disputed borders and haunted roads";

    await nameInput.fill("Saved AGM Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("tabletop");
    await designIntentInput.fill(savedIntent);
    await designIntentInput.blur();
    await projectDocumentPanel.getByRole("button", {name: "Save AGM draft"}).click();

    await expect.poll(() =>
      page.evaluate(() => {
        const rawDraft = localStorage.getItem("agm.documentDraft");
        return rawDraft ? JSON.parse(rawDraft) : null;
      }),
    ).toMatchObject({
      schema: "agm.document.v0",
      document: {
        name: "Saved AGM Draft",
        gameProfile: "tabletop",
        designIntent: savedIntent,
      },
      world: {
        schema: "agm.world.v0",
        game: {profile: "tabletop"},
      },
    });

    await nameInput.fill("Unsaved Drift Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("strategy");
    await designIntentInput.fill("This unsaved edit should be restored away");
    await designIntentInput.blur();

    await openExportWorkspace(page);
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Restore AGM draft"}).click();
    await projectNav.click();

    await expect(nameInput).toHaveValue("Saved AGM Draft");
    await expect(gameProfileSelect).toHaveValue("tabletop");
    await expect(designIntentInput).toHaveValue(savedIntent);
    await expect(projectDocumentPanel).toContainText("Tabletop campaign map");
    await expect(projectDocumentPanel).toContainText("Document sourceAGM Studio");
    await expect.poll(() => page.evaluate(() => (window as any).mapName?.value || "")).toBe("Saved AGM Draft");
  });

  test("exports a minimal AGM draft file from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const designIntent = "Export this open-world campaign draft with factions and mountain passes";

    await nameInput.fill("Downloadable AGM Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("open-world");
    await designIntentInput.fill(designIntent);
    await designIntentInput.blur();

    await openExportWorkspace(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export AGM file"}).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Downloadable-AGM-Draft.agm");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const exportedDraft = JSON.parse(await fs.readFile(downloadPath!, "utf8"));
    expect(exportedDraft).toMatchObject({
      schema: "agm.document.v0",
      document: {
        name: "Downloadable AGM Draft",
        gameProfile: "open-world",
        designIntent,
      },
      world: {
        schema: "agm.world.v0",
        project: {name: "Downloadable AGM Draft"},
        game: {profile: "open-world"},
      },
    });
  });

  test("exports an AGM Rules Pack file from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");

    await nameInput.fill("Rules Pack Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("4x");
    await designIntentInput.fill("Export biome and resource rules as a reusable rules pack");
    await designIntentInput.blur();
    await expect(page.locator("#studioProjectWorldJsonDraft")).toContainText('"rules"');

    await openExportWorkspace(page);
    await page.locator(".studio-sidebar--right summary").getByText("Advanced formats", {exact: true}).click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export AGM Rules Pack"}).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Rules-Pack-Draft.agm-rules.json");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const rulesPack = JSON.parse(await fs.readFile(downloadPath!, "utf8"));
    expect(rulesPack).toMatchObject({
      schema: "agm.rules.v0",
      version: 1,
      source: "agm-biome-summary",
      biomeRules: expect.any(Array),
      resourceTags: expect.any(Array),
      resourceRules: expect.any(Array),
      profileRules: expect.objectContaining({
        profile: "4x",
        profileLabel: "4X civilization map",
        priorities: expect.any(Array),
        sourceFields: expect.arrayContaining(["document.gameProfile", "resources.provinces", "resources.routes", "resources.biomes.agmResourceTag"]),
      }),
      weights: expect.objectContaining({
        defaultRuleWeight: 1,
        ruleWeightRange: {min: 0, max: 5},
        sourceFields: expect.arrayContaining(["resources.biomes.habitability", "resources.biomes.agmRuleWeight", "resources.biomes.agmResourceTag"]),
      }),
    });
    expect(rulesPack.biomeRules.length).toBeGreaterThan(0);
    expect(rulesPack.biomeRules[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^biome-rule-\d+$/), biomeId: expect.any(Number), biomeName: expect.any(String), ruleWeight: expect.any(Number), resourceTag: expect.any(String), source: expect.stringMatching(/^(agm-biome-summary|studio-metadata)$/)}));
    expect(rulesPack.resourceTags[0]).toEqual(expect.objectContaining({tag: expect.any(String), biomeIds: expect.any(Array), role: expect.stringMatching(/^(starter|challenge|neutral)$/)}));
    expect(rulesPack.resourceTags.flatMap((tag: any) => tag.biomeIds)).toEqual(expect.arrayContaining([rulesPack.biomeRules[0].biomeId]));
    expect(rulesPack.resourceRules[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^resource-rule-/), distribution: "biome-tag-derived", priority: expect.stringMatching(/^(start-support|challenge-zone|neutral-coverage)$/), biomeIds: expect.any(Array), provinceIds: expect.any(Array), routeIds: expect.any(Array), routePointCount: expect.any(Number), coverageScore: expect.any(Number)}));
    expect(rulesPack.profileRules.priorities).toEqual(expect.arrayContaining([expect.objectContaining({id: "fair-expansion", target: "spawn", weight: expect.any(Number)})]));
  });

  test("imports an AGM Rules Pack file and restores biome rule metadata", async ({page}, testInfo) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const targetBiomeId = await page.evaluate(() => (window as any).biomesData.i.find((id: number) => typeof (window as any).biomesData.name[id] === "string"));
    const rulesPackPath = testInfo.outputPath("imported-rules-pack.agm-rules.json");
    const rulesPack = {
      schema: "agm.rules.v0",
      version: 1,
      source: "agm-biome-summary",
      biomeRules: [
        {
          id: `biome-rule-${targetBiomeId}`,
          biomeId: targetBiomeId,
          biomeName: "Imported biome rule",
          habitability: 66,
          movementCost: null,
          ruleWeight: 2.4,
          resourceTag: "challenge-biome",
          source: "studio-metadata",
        },
      ],
      resourceTags: [{tag: "challenge-biome", biomeIds: [targetBiomeId], role: "challenge"}],
      resourceRules: [
        {
          id: "resource-rule-challenge-biome",
          tag: "challenge-biome",
          role: "challenge",
          distribution: "biome-tag-derived",
          priority: "challenge-zone",
          biomeIds: [targetBiomeId],
          provinceIds: [],
          routeIds: [],
          routePointCount: 0,
          coverageScore: 12,
        },
      ],
      profileRules: {
        profile: "rpg",
        profileLabel: "RPG world",
        priorities: [{id: "quest-route-connectivity", label: "Quest route readability", weight: 1.3, target: "connectivity"}],
        sourceFields: ["document.gameProfile", "resources.provinces", "resources.routes", "resources.biomes.agmResourceTag"],
      },
      weights: {
        defaultRuleWeight: 1,
        ruleWeightRange: {min: 0, max: 5},
        sourceFields: ["resources.biomes.habitability", "resources.biomes.agmRuleWeight", "resources.biomes.agmResourceTag"],
      },
    };
    await fs.writeFile(rulesPackPath, JSON.stringify(rulesPack, null, 2));

    await openExportWorkspace(page);
    await page.locator(".studio-sidebar--right summary").getByText("Advanced formats", {exact: true}).click();
    await page.locator("#studioRulesPackFileInput").setInputFiles(rulesPackPath);
    await projectNav.click();
    const balanceChecker = await openBalanceChecker(page);

    await expect
      .poll(() => page.evaluate(({biomeId}) => ({
        agmRuleWeight: (window as any).biomesData.agmRuleWeight?.[biomeId],
        agmResourceTag: (window as any).biomesData.agmResourceTag?.[biomeId],
      }), {biomeId: targetBiomeId}))
      .toEqual({agmRuleWeight: 2.4, agmResourceTag: "challenge-biome"});
    await expect(balanceChecker).toContainText("import-rules-pack-v1");

    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        const importedRule = draft.rules.biomeRules.find((rule: any) => rule.biomeId === targetBiomeId);
        const importedChange = draft.playability.appliedPreviewChanges.find((change: any) => change.draftId === "import-rules-pack-v1" && change.refs.biomes.includes(targetBiomeId));
        return {importedRule, importedChange};
      }),
    ).toMatchObject({
      importedRule: expect.objectContaining({biomeId: targetBiomeId, ruleWeight: expect.any(Number), resourceTag: "challenge-biome", source: "studio-metadata"}),
      importedChange: expect.objectContaining({draftId: "import-rules-pack-v1", fields: expect.objectContaining({agmRuleWeight: 2.4, agmResourceTag: "challenge-biome", tuningReason: "rules-pack-import", rulesPackVersion: 1})}),
    });
  });

  test("exports GeoJSON, heightmap metadata, and engine manifest files from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");

    await nameInput.fill("Engine Export Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("strategy");

    await openExportWorkspace(page);
    await expect(page.locator(".studio-sidebar--right")).toContainText("Map layers");
    await page.locator(".studio-sidebar--right summary").getByText("Advanced formats", {exact: true}).click();
    await page.locator(".studio-sidebar--right summary").getByText("Engine handoff", {exact: true}).click();

    const geoJsonDownloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export GeoJSON Map Layers"}).click();
    const geoJsonDownload = await geoJsonDownloadPromise;
    expect(geoJsonDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-map-layers.geojson");
    const geoJsonPath = await geoJsonDownload.path();
    expect(geoJsonPath).toBeTruthy();
    const geoJson = JSON.parse(await fs.readFile(geoJsonPath!, "utf8"));
    expect(geoJson).toMatchObject({type: "FeatureCollection", schema: "agm.geojson-map-layers.v0", profile: "strategy", features: expect.any(Array)});
    expect(geoJson.features.map((feature: any) => feature.properties.layer)).toEqual(expect.arrayContaining(["resource", "province", "biome"]));
    expect(geoJson.features[0]).toEqual(expect.objectContaining({type: "Feature", geometry: expect.objectContaining({type: "Point", coordinates: expect.any(Array)}), properties: expect.objectContaining({coordinateSystem: "agm-layer-grid"})}));

    const heightmapDownloadPromise = page.waitForEvent("download");
    await clickAdvancedExportButton(page, "Export Heightmap Metadata");
    const heightmapDownload = await heightmapDownloadPromise;
    expect(heightmapDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-heightmap.json");
    const heightmapPath = await heightmapDownload.path();
    expect(heightmapPath).toBeTruthy();
    const heightmap = JSON.parse(await fs.readFile(heightmapPath!, "utf8"));
expect(heightmap).toMatchObject({schema: "agm.heightmap-metadata.v0", manifest: expect.objectContaining({profile: "strategy"}), map: expect.objectContaining({width: expect.any(Number), height: expect.any(Number), heightmapTemplate: expect.any(String)}), interpretation: expect.objectContaining({source: "agm-template", rasterStatus: "metadata-only"})});

    const heightfieldDownloadPromise = page.waitForEvent("download");
    await clickAdvancedExportButton(page, "Export Heightfield JSON");
    const heightfieldDownload = await heightfieldDownloadPromise;
    expect(heightfieldDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-heightfield.json");
    const heightfieldPath = await heightfieldDownload.path();
    expect(heightfieldPath).toBeTruthy();
    const heightfield = JSON.parse(await fs.readFile(heightfieldPath!, "utf8"));
    expect(heightfield).toMatchObject({schema: "agm.heightfield.v0", manifest: expect.objectContaining({profile: "strategy"}), grid: expect.objectContaining({width: expect.any(Number), height: expect.any(Number), coordinateSystem: "agm-layer-grid", sampleSpacing: 1}), normalization: expect.objectContaining({min: 0, max: 100, valueType: "normalized-height"}), source: expect.objectContaining({type: "reconstructable-layer-derived"}), values: expect.any(Array)});
    expect(heightfield.grid.width).toBeGreaterThan(0);
    expect(heightfield.grid.height).toBeGreaterThan(0);
    expect(heightfield.values.length).toBe(heightfield.grid.width * heightfield.grid.height);
    expect(heightfield.values.every((value: any) => typeof value === "number" && value >= 0 && value <= 100)).toBe(true);

    const heightmapPngDownloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export Heightmap PNG"}).click();
    const heightmapPngDownload = await heightmapPngDownloadPromise;
    expect(heightmapPngDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-heightmap.png");
    const heightmapPngPath = await heightmapPngDownload.path();
    expect(heightmapPngPath).toBeTruthy();
    const heightmapPng = await fs.readFile(heightmapPngPath!);
    expect(heightmapPng.length).toBeGreaterThan(8);
    expect(Array.from(heightmapPng.subarray(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    const heightmapRaw16DownloadPromise = page.waitForEvent("download");
    await clickAdvancedExportButton(page, "Export Heightmap RAW16");
    const heightmapRaw16Download = await heightmapRaw16DownloadPromise;
    expect(heightmapRaw16Download.suggestedFilename()).toBe("Engine-Export-Draft.agm-heightmap-r16.raw");
    const heightmapRaw16Path = await heightmapRaw16Download.path();
    expect(heightmapRaw16Path).toBeTruthy();
    const heightmapRaw16 = await fs.readFile(heightmapRaw16Path!);
    expect(heightmapRaw16.length).toBe(heightfield.values.length * 2);
    const firstRaw16Value = heightmapRaw16.readUInt16LE(0);
    expect(firstRaw16Value).toBeGreaterThanOrEqual(0);
    expect(firstRaw16Value).toBeLessThanOrEqual(65535);

    const manifestDownloadPromise = page.waitForEvent("download");
    await clickEngineHandoffButton(page, "Export Engine Manifest");
    const manifestDownload = await manifestDownloadPromise;
    expect(manifestDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-engine-manifest.json");
    const manifestPath = await manifestDownload.path();
    expect(manifestPath).toBeTruthy();
    const engineManifest = JSON.parse(await fs.readFile(manifestPath!, "utf8"));
    expect(engineManifest).toMatchObject({schema: "agm.engine-manifest.v0", manifest: expect.objectContaining({profile: "strategy"}), files: expect.any(Array), layers: expect.any(Array)});
    expect(engineManifest.targets).toEqual(expect.arrayContaining(["unity", "godot", "unreal", "tiled", "geojson", "heightmap", "heightfield", "raster", "terrain-raw16"]));
    expect(engineManifest.files.map((file: any) => file.kind)).toEqual(expect.arrayContaining(["agm-world", "resource-map", "province-map", "biome-map", "tiled-map", "geojson-map-layers", "heightmap-metadata", "heightfield", "heightmap-png", "heightmap-raw16"]));
    expect(engineManifest.importLayout).toMatchObject({root: "Assets/AGM/Engine-Export-Draft", dataDirectory: "Data", mapsDirectory: "Maps", metadataDirectory: "Metadata", recommendedFiles: expect.any(Array)});
    expect(engineManifest.importLayout.recommendedFiles).toEqual(expect.arrayContaining([expect.objectContaining({kind: "agm-world", recommendedPath: "Maps/Engine-Export-Draft.agm-world.json"})]));
    expect(engineManifest.importLayout.recommendedFiles.every((file: any) => typeof file.recommendedPath === "string" && file.recommendedPath.length > 0)).toBe(true);
    expect(engineManifest.terrainSource).toEqual(expect.objectContaining({heightfieldSchema: "agm.heightfield.v0", rawSchema: "raw.uint16-heightmap.le.v1", rawEncoding: "uint16-little-endian", coordinateSystem: "agm-layer-grid", sampleSpacing: 1}));
    const expectedArtifactContract = {schema: "agm.engine-package-contract.v0", packageFormat: "agm.engine-package.v0", layoutVersion: 0, manifestSchema: "agm.engine-manifest.v0", sampleMetadataSchema: "agm.importer-sample-metadata.v0", unityPackageLayoutSchema: "agm.unity-package-layout.v0", zipParsingSupported: false, productionPluginsIncluded: false, validationMode: "extracted-directory-only"};
    expect(engineManifest.artifactContract).toEqual(expectedArtifactContract);
    const expectedProductionPluginBoundary = expect.objectContaining({status: "source-sample-and-validation-prototype-only", productionPluginsIncluded: false, compiledPluginsIncluded: false, enginePackagesIncluded: false, exportedUnityAssetsIncluded: false, validatorTempArtifactsAreProductionAssets: false, sourceSamplesMayBeAdaptedIntoPlugins: true, productionizationRequiredBeforeRuntimeUse: true, validatorTempArtifactRoot: "Assets/AGM/Validation/EditorPrototypeAssets", productionPluginStatus: "not-included-review-required"});
    expect(engineManifest.productionPluginBoundary).toEqual(expectedProductionPluginBoundary);
    expect(engineManifest.productionPluginBoundary.forbiddenExportExtensions).toEqual(expect.arrayContaining([".cs", ".dll", ".asmdef", ".asset", ".prefab", ".unitypackage"]));
    expect(engineManifest.productionPluginBoundary.forbiddenUnityPackageFiles).toEqual(expect.arrayContaining(["handoff/importers/unity/package.json"]));
    const expectedUnityProductionImporterPackagingPlan = expect.objectContaining({status: "scaffolded-separate-deliverable", scaffoldStatus: "runtime-importer-contract-hardened", packageName: "com.agm.importers.unity", packageRoot: "Packages/com.agm.importers.unity", distribution: "separate-versioned-unity-package", packageVersion: "0.1.0-preview.1", includedInEnginePackageZip: false, requiresProductionizationReview: true, packageJsonIncludedInEnginePackage: false, asmdefIncludedInEnginePackage: false, compiledAssembliesIncludedInEnginePackage: false, runtimeAssembly: "AGM.Importers.Unity.Runtime", editorAssembly: "AGM.Importers.Unity.Editor", scaffoldValidation: "local-repository-package-files-and-runtime-importer-contract", enginePackageBoundaryRef: "productionPluginBoundary"});
    const expectedGodotAddonBoundaryReview = expect.objectContaining({schema: "agm.godot-addon-boundary-review.v0", status: "source-sample-boundary-verified", deliverableRoot: "addons/agm_importers_godot", enginePackageZipIncludesDeliverable: false, productionAddonIncluded: false, pluginCfgIncludedInEnginePackage: false, productionGdScriptsIncludedInEnginePackage: false, resourceOutputsIncludedInEnginePackage: false, sceneOutputsIncludedInEnginePackage: false, sourceSampleOnly: true, realGodotSmokeRequired: true, releaseCandidateReady: false});
    const expectedUnrealPluginBoundaryReview = expect.objectContaining({schema: "agm.unreal-plugin-boundary-review.v0", status: "source-sample-boundary-verified", deliverableRoot: "Plugins/AGMImportersUnreal", enginePackageZipIncludesDeliverable: false, productionPluginIncluded: false, upluginIncludedInEnginePackage: false, buildCsIncludedInEnginePackage: false, productionCppIncludedInEnginePackage: false, cookedAssetsIncludedInEnginePackage: false, sourceSampleOnly: true, realUnrealSmokeRequired: true, releaseCandidateReady: false});
    const expectedRealEngineSmokeRecords = expect.objectContaining({schema: "agm.real-engine-smoke-records.v0", status: "not-captured", releaseCandidateReady: false, capturedEngines: [], missingEngines: ["unity", "godot", "unreal"], nextAction: "capture-real-engine-smoke-records", records: expect.objectContaining({unity: expect.objectContaining({engine: "unity", status: "not-captured", requiredForReleaseCandidate: true, executableValidated: false, smokeType: "batchmode-package-import-and-editor-prototype", reportSchema: "agm.unity-validation-report.v0", mockOrFixtureResult: false}), godot: expect.objectContaining({engine: "godot", status: "not-captured", requiredForReleaseCandidate: true, executableValidated: false, smokeType: "addon-import-contract-smoke", expectedDeliverableRoot: "addons/agm_importers_godot", reportSchema: "agm.godot-addon-smoke-report.v0", mockOrFixtureResult: false}), unreal: expect.objectContaining({engine: "unreal", status: "not-captured", requiredForReleaseCandidate: true, executableValidated: false, smokeType: "plugin-commandlet-import-contract-smoke", expectedDeliverableRoot: "Plugins/AGMImportersUnreal", reportSchema: "agm.unreal-plugin-smoke-report.v0", mockOrFixtureResult: false})})});
    const expectedGodotProductionImporterPackagingPlan = expect.objectContaining({status: "source-sample-scaffolded-separate-addon-review-required", scaffoldStatus: "runtime-importer-source-sample-contract", addonName: "agm_importers_godot", addonRoot: "addons/agm_importers_godot", distribution: "separate-versioned-godot-addon", targetGodotVersion: "4.x", includedInEnginePackageZip: false, requiresProductionizationReview: true, pluginCfgIncludedInEnginePackage: false, gdScriptIncludedAsProductionAddon: false, productionAddonIncluded: false, addonBoundaryReview: expectedGodotAddonBoundaryReview, enginePackageBoundaryRef: "productionPluginBoundary"});
    const expectedUnrealProductionImporterPackagingPlan = expect.objectContaining({status: "source-sample-scaffolded-separate-plugin-review-required", scaffoldStatus: "runtime-importer-source-sample-contract", pluginName: "AGMImportersUnreal", pluginRoot: "Plugins/AGMImportersUnreal", distribution: "separate-versioned-unreal-plugin", targetUnrealVersion: "5.x", includedInEnginePackageZip: false, requiresProductionizationReview: true, upluginIncludedInEnginePackage: false, cppSourceIncludedAsProductionPlugin: false, productionPluginIncluded: false, pluginBoundaryReview: expectedUnrealPluginBoundaryReview, enginePackageBoundaryRef: "productionPluginBoundary"});
    expect(engineManifest.unityProductionImporterPackagingPlan).toEqual(expectedUnityProductionImporterPackagingPlan);
    expect(engineManifest.godotProductionImporterPackagingPlan).toEqual(expectedGodotProductionImporterPackagingPlan);
    expect(engineManifest.unrealProductionImporterPackagingPlan).toEqual(expectedUnrealProductionImporterPackagingPlan);
    expect(engineManifest.realEngineSmokeRecords).toEqual(expectedRealEngineSmokeRecords);
    expect(engineManifest.unrealProductionImporterPackagingPlan.plannedFiles).toEqual(expect.arrayContaining(["AGMImportersUnreal.uplugin", "Source/AGMImportersUnreal/AGMImportersUnreal.Build.cs", "Source/AGMImportersUnreal/Private/AgmImporter.cpp", "README.md"]));
    expect(engineManifest.unrealProductionImporterPackagingPlan.sourceSampleInputs).toEqual(expect.arrayContaining(["handoff/importers/unreal/README.md", "handoff/importers/unreal/AgmImporterStub.cpp.txt"]));
    expect(engineManifest.unrealProductionImporterPackagingPlan.runtimeImporterContract).toEqual(expect.objectContaining({status: "reads-engine-package-contract-source-sample", readsManifest: true, readsSampleMetadata: true, readsHeightfieldJson: true, readsRaw16Terrain: true, decodesRaw16LittleEndian: true, countsMapLayerRecords: true, productionAssetOutput: false, createsUnrealAssets: false, createsUObjects: false, createsImportFactory: false}));
    expect(engineManifest.unrealProductionImporterPackagingPlan.validationGates).toEqual(expect.arrayContaining(["unreal-source-sample-present", "unreal-production-plugin-boundary", "no-export-zip-plugin-contamination"]));
    expect(engineManifest.unrealProductionImporterPackagingPlan.releaseCandidateReview).toEqual(expect.objectContaining({status: "pre-plugin-release-candidate-checklist", sourceSampleDocumented: true, pluginBoundaryDocumented: true, realUnrealValidationRequired: true, releaseCandidateReady: false}));
    expect(engineManifest.unrealProductionImporterPackagingPlan.pluginBoundaryReview).toEqual(expectedUnrealPluginBoundaryReview);
    expect(engineManifest.godotProductionImporterPackagingPlan.plannedFiles).toEqual(expect.arrayContaining(["plugin.cfg", "agm_importer.gd", "README.md"]));
    expect(engineManifest.godotProductionImporterPackagingPlan.sourceSampleInputs).toEqual(expect.arrayContaining(["handoff/importers/godot/README.md", "handoff/importers/godot/agm_importer_stub.gd.txt"]));
    expect(engineManifest.godotProductionImporterPackagingPlan.runtimeImporterContract).toEqual(expect.objectContaining({status: "reads-engine-package-contract-source-sample", readsManifest: true, readsSampleMetadata: true, readsHeightfieldJson: true, readsRaw16Terrain: true, decodesRaw16LittleEndian: true, countsMapLayerRecords: true, productionAssetOutput: false, createsGodotResources: false, createsPackedScenes: false, createsImportPlugin: false}));
    expect(engineManifest.godotProductionImporterPackagingPlan.validationGates).toEqual(expect.arrayContaining(["godot-source-sample-present", "godot-production-addon-boundary", "no-export-zip-plugin-contamination"]));
    expect(engineManifest.godotProductionImporterPackagingPlan.releaseCandidateReview).toEqual(expect.objectContaining({status: "pre-addon-release-candidate-checklist", sourceSampleDocumented: true, addonBoundaryDocumented: true, realGodotValidationRequired: true, releaseCandidateReady: false}));
    expect(engineManifest.godotProductionImporterPackagingPlan.addonBoundaryReview).toEqual(expectedGodotAddonBoundaryReview);
    expect(engineManifest.unityProductionImporterPackagingPlan.plannedFiles).toEqual(expect.arrayContaining(["package.json", "Runtime/AGM.Importers.Unity.Runtime.asmdef", "Runtime/AgmRuntimePackageImporter.cs", "Runtime/AgmPackageTypes.cs", "Editor/AGM.Importers.Unity.Editor.asmdef", "Editor/AgmImportMenu.cs", "Editor/AgmAssetAuthoringPrototype.cs", "Samples~/ImporterFixture/README.md"]));
    expect(engineManifest.unityProductionImporterPackagingPlan.scaffoldFiles).toEqual(expect.arrayContaining(["package.json", "Runtime/AGM.Importers.Unity.Runtime.asmdef", "Runtime/AgmRuntimePackageImporter.cs", "Runtime/AgmPackageTypes.cs", "Editor/AGM.Importers.Unity.Editor.asmdef", "Editor/AgmImportMenu.cs", "Editor/AgmAssetAuthoringPrototype.cs", "Samples~/ImporterFixture/README.md"]));
    expect(engineManifest.unityProductionImporterPackagingPlan.runtimeImporterContract).toEqual(expect.objectContaining({status: "reads-engine-package-contract", readsManifest: true, readsPackageLayout: true, readsSampleMetadata: true, readsHeightfieldJson: true, readsRaw16Terrain: true, validatesRaw16ByteLength: true, validatesHeightfieldGrid: true, countsMapLayerRecords: true, exposesInspectReport: true, inspectReportSchema: "agm.unity-runtime-import-report.v0", exposesImportSummary: true, exposesIssueTaxonomy: true, issueSchema: "agm.unity-runtime-import-issue.v0", productionAssetOutput: false}));
    expect(engineManifest.unityProductionImporterPackagingPlan.runtimeImporterContract.issueCodes).toEqual(expect.arrayContaining(["package-root-missing", "required-directory-missing", "required-file-count-mismatch", "heightfield-grid-missing", "heightfield-sample-count-mismatch", "raw16-byte-length-mismatch"]));
    expect(engineManifest.unityProductionImporterPackagingPlan.runtimeImporterContract.usageContract).toEqual(expect.objectContaining({packageInstallMode: "separate-unity-package", importApi: "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage", inspectApi: "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage", errorContract: "AgmImportException.Issue", runtimeCreatesAssets: false}));
    expect(engineManifest.unityProductionImporterPackagingPlan.runtimeImporterContract.readsMapLayers).toEqual(expect.arrayContaining(["resource", "province", "biome"]));
    expect(engineManifest.unityProductionImporterPackagingPlan.releaseCandidateReview).toEqual(expect.objectContaining({status: "pre-release-candidate-checklist", packageMetadataReviewed: true, usageContractDocumented: true, runtimeIssueTaxonomyCovered: true, mockUnityFixtureRequired: true, realUnityValidationRequired: true, enginePackageZipBoundaryRequired: true, releaseCandidateReady: false}));
    expect(engineManifest.unityProductionImporterPackagingPlan.packageCompileGate).toEqual(expect.objectContaining({status: "validator-temp-unity-project-compile-gate", packageCopiedToTempProject: true, packageRoot: "Packages/com.agm.importers.unity", validatesPackageJson: true, validatesRuntimeAsmdef: true, validatesEditorAsmdef: true, validatesRuntimeImporterSource: true, validatesEditorSource: true, includedInEnginePackageZip: false}));
    expect(engineManifest.unityProductionImporterPackagingPlan.validationGates).toEqual(expect.arrayContaining(["artifact-contract", "package-layout", "raw16-terrain-import", "map-layer-import", "editor-asset-authoring", "unity-package-import-smoke-test", "unity-package-release-candidate-review", "no-export-zip-plugin-contamination"]));
    expect(engineManifest.unityProductionImporterPackagingPlan.packageImportSmokeTest).toEqual(expect.objectContaining({schema: "agm.unity-package-import-smoke-test.v0", status: "validator-temp-unity-project-package-importer-smoke-test", packageImporter: "AGM.Importers.Unity.AgmRuntimePackageImporter.ImportFromUnpackedPackage", sourceSampleImporter: "AgmRuntimePackageImporter.ImportFromUnpackedPackage", runtimeApi: "AGM.Importers.Unity.AgmRuntimePackageImporter.InspectUnpackedPackage", runtimeReportSchema: "agm.unity-runtime-import-report.v0", comparesAgainstSourceSample: true, productionAssetOutput: false, includedInEnginePackageZip: false}));
    expect(engineManifest.importerHandoff).toEqual(expect.objectContaining({readmePath: "handoff/README.md", sampleMetadataPath: "handoff/importer-sample-metadata.json", artifactContract: expectedArtifactContract, productionPluginBoundary: expectedProductionPluginBoundary, unityProductionImporterPackagingPlan: expectedUnityProductionImporterPackagingPlan, godotProductionImporterPackagingPlan: expectedGodotProductionImporterPackagingPlan, unrealProductionImporterPackagingPlan: expectedUnrealProductionImporterPackagingPlan, realEngineSmokeRecords: expectedRealEngineSmokeRecords, noPluginIncluded: true, packageFormat: "agm.engine-package.v0", layout: expect.objectContaining({rootDirectories: ["manifest", "maps", "terrain", "handoff"], requiredFiles: expect.any(Array), optionalFiles: expect.any(Array), engineArtifactFiles: expect.any(Array)}), sampleStubPaths: expect.any(Array), bridgeValidation: expect.objectContaining({engine: "unity", status: "zip-content-e2e-validated", runtimeValidated: false}), unityRuntimeImporterSpike: expect.objectContaining({status: "source-sample-included", runtimeValidated: false, editorValidated: false, createsUnityProject: false, dependencyPolicy: "unity-builtins-only"}), unityValidationHarness: expect.objectContaining({status: "available", mode: "local-structure-validation-with-optional-unity-cli", scriptPath: "scripts/validate-unity-export.mjs", unityCliValidation: "optional-batchmode-terrain-prototype-check", batchmodeMethod: "AgmValidationBatchmode.Run", importerSmokeTest: "AgmRuntimePackageImporter.ImportFromUnpackedPackage", prototypeReport: "Assets/AGM/Validation/agm-imported-package-report.json", terrainPrototypeReport: "terrainPrototype", prototypeValidation: "metadata-json-only", reportSchema: "agm.unity-validation-report.v0", runtimeValidated: false, editorValidated: false, createsUnityProject: false}), unityImporterArtifactPaths: expect.any(Array), entryFiles: expect.any(Array), engines: expect.any(Array)}));
    expect(engineManifest.importerHandoff.entryFiles.map((file: any) => file.kind)).toEqual(expect.arrayContaining(["engine-manifest", "agm-world", "heightmap-raw16", "heightfield", "heightmap-metadata"]));
    expect(engineManifest.importerHandoff.layout.requiredFiles).toEqual(expect.arrayContaining(["manifest/Engine-Export-Draft.agm-engine-manifest.json", "maps/Engine-Export-Draft.agm-world.json", "maps/Engine-Export-Draft.agm-resource-map.json", "maps/Engine-Export-Draft.agm-province-map.json", "maps/Engine-Export-Draft.agm-biome-map.json", "terrain/Engine-Export-Draft.agm-heightmap.json", "terrain/Engine-Export-Draft.agm-heightfield.json", "terrain/Engine-Export-Draft.agm-heightmap-r16.raw", "handoff/README.md", "handoff/importer-sample-metadata.json"]));
    expect(engineManifest.importerHandoff.layout.optionalFiles).toEqual(expect.arrayContaining(["maps/Engine-Export-Draft.agm-tiled-map.json", "maps/Engine-Export-Draft.agm-map-layers.geojson", "terrain/Engine-Export-Draft.agm-heightmap.png"]));
    expect(engineManifest.importerHandoff.layout.engineArtifactFiles).toEqual(expect.arrayContaining(["handoff/importers/unity/AgmImporterStub.cs.txt", "handoff/importers/godot/agm_importer_stub.gd.txt", "handoff/importers/unreal/AgmImporterStub.cpp.txt", "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "handoff/importers/unity/package-layout.json"]));
    expect(engineManifest.importerHandoff.engines.map((engine: any) => engine.engine)).toEqual(expect.arrayContaining(["unity", "godot", "unreal"]));
    expect(engineManifest.importerHandoff.sampleStubPaths.map((stub: any) => stub.engine)).toEqual(expect.arrayContaining(["unity", "godot", "unreal"]));
    expect(engineManifest.importerHandoff.sampleStubPaths.flatMap((stub: any) => stub.paths)).toEqual(expect.arrayContaining(["handoff/importers/unity/AgmImporterStub.cs.txt", "handoff/importers/godot/agm_importer_stub.gd.txt", "handoff/importers/unreal/AgmImporterStub.cpp.txt", "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "handoff/importers/unity/package-layout.json"]));
    expect(engineManifest.importerHandoff.unityImporterArtifactPaths).toEqual(expect.arrayContaining(["handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "handoff/importers/unity/package-layout.json"]));
    expect(engineManifest.importerHandoff.unityValidationHarness.checks).toEqual(expect.arrayContaining(["artifact-contract", "layout-version", "layout-required-files", "sample-metadata-contract", "unity-layout-contract", "engine-stub-contracts", "production-plugin-boundary", "unity-production-importer-packaging-plan", "unity-production-importer-package-scaffold", "unity-production-importer-runtime-contract", "unity-package-compile-gate", "unity-package-import-smoke-test", "no-production-plugin-claims", "zip-validation-disabled", "unity-contract-consumed", "unity-package-layout-consumed", "unity-map-layer-records", "unity-map-layer-summaries", "unity-prototype-report-contract", "unity-prototype-non-asset-output", "unity-asset-authoring-spike-metadata", "unity-asset-authoring-report", "unity-asset-authoring-non-asset-output", "unity-forbidden-editor-apis-absent", "unity-runtime-importer-called", "unity-imported-package-report", "unity-data-asset-prototype", "terrain-prototype-grid", "terrain-prototype-height-source", "terrain-prototype-raw16-range", "terrain-prototype-map-layer-refs"]));
    expect(engineManifest.importerHandoff.unityVerticalSlicePrototype).toEqual(expect.objectContaining({status: "source-sample-prototype", outputKind: "metadata-json-only", productionPluginIncluded: false, createsUnityTerrainAsset: false, createsScriptableObjectAsset: false, runtimeValidated: false, editorValidated: false}));
    expect(engineManifest.importerHandoff.unityAssetAuthoringSpike).toEqual(expect.objectContaining({status: "editor-source-sample-prototype", schema: "agm.unity-asset-authoring-plan.v0", sourceScript: "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", outputKind: "temporary-unity-project-editor-artifacts", outputScope: "validator-temp-unity-project-only", reportBlock: "assetAuthoringPrototype", exportedAssetsIncluded: false, createsUnityTerrainAssetInExport: false, createsScriptableObjectAssetInExport: false, createsPrefabAssetInExport: false, createsUnityPackage: false, productionPluginIncluded: false, runtimeValidated: false, editorValidated: false}));
    expect(engineManifest.importerHandoff.unityAssetAuthoringSpike.intendedArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({kind: "terrain-data", futureUnityType: "TerrainData", exportedAssetIncluded: false, validatorTempProjectCreatesAsset: true}), expect.objectContaining({kind: "world-scriptable-object", futureUnityType: "ScriptableObject", exportedAssetIncluded: false, validatorTempProjectCreatesAsset: true}), expect.objectContaining({kind: "prefab", futureUnityType: "Prefab", exportedAssetIncluded: false, validatorTempProjectCreatesAsset: true})]));
    expect(engineManifest.enginePackageStructure).toEqual(expect.any(Array));
    expect(engineManifest.enginePackageStructure.map((item: any) => item.engine)).toEqual(expect.arrayContaining(["unity", "godot", "unreal"]));
    for (const packageStructure of engineManifest.enginePackageStructure) {
      expect(packageStructure).toEqual(expect.objectContaining({root: expect.any(String), directories: expect.any(Array), terrainFiles: expect.any(Array), importHints: expect.any(Object)}));
      expect(packageStructure.terrainFiles.map((file: any) => file.kind)).toEqual(expect.arrayContaining(["heightmap-raw16", "heightfield", "heightmap-png", "heightmap-metadata"]));
      expect(packageStructure.importHints).toEqual(expect.objectContaining({rawEncoding: "uint16-little-endian", bitDepth: 16, endianness: "little-endian", rawFileKind: "heightmap-raw16"}));
    }
    expect(engineManifest.engineProfiles.map((profile: any) => profile.engine)).toEqual(expect.arrayContaining(["unity", "godot", "unreal"]));
    for (const profile of engineManifest.engineProfiles) {
      expect(profile).toEqual(expect.objectContaining({assetRoot: expect.any(String), loaderHint: expect.any(String), requiredFiles: expect.any(Array), optionalFiles: expect.any(Array), layerBindings: expect.any(Array), packageStructureRef: profile.engine, terrainDirectories: expect.any(Array), terrainImport: expect.objectContaining({rawFileKind: "heightmap-raw16", rawEncoding: "uint16-little-endian", bitDepth: 16}), coordinateSystem: "agm-layer-grid", heightmapStatus: "heightfield-json", heightDataStatus: "reconstructable-json", heightRasterStatus: "png-8bit-and-raw-uint16", heightRawStatus: "raw-uint16-little-endian"}));
      expect(profile.requiredFiles).toEqual(expect.arrayContaining(["agm-world", "resource-map", "province-map", "biome-map"]));
      expect(profile.layerBindings).toEqual(expect.arrayContaining([expect.objectContaining({layer: "resource", fileKind: "resource-map"}), expect.objectContaining({layer: "province", fileKind: "province-map"}), expect.objectContaining({layer: "biome", fileKind: "biome-map"}), expect.objectContaining({layer: "heightfield", fileKind: "heightfield"}), expect.objectContaining({layer: "heightmap-raster", fileKind: "heightmap-png"}), expect.objectContaining({layer: "heightmap-raw16", fileKind: "heightmap-raw16"})]));
    }
    expect(engineManifest.validation.requiredSchemas).toEqual(expect.arrayContaining(["agm.package.v0", "agm.resource-map.v0", "agm.province-map.v0", "agm.biome-map.v0", "tiled.map.v1", "agm.geojson-map-layers.v0", "agm.heightmap-metadata.v0", "agm.heightfield.v0", "png.grayscale-heightmap.v1", "raw.uint16-heightmap.le.v1"]));
    expect(engineManifest.validation.warnings).toEqual(expect.arrayContaining([expect.stringContaining("RAW16 height export is available"), expect.stringContaining("Importer stubs are documentation samples only")]));
    expect(engineManifest.validation.warnings.join(" ")).not.toContain("RAW and 16-bit terrain export are still pending");

    const enginePackageDownloadPromise = page.waitForEvent("download");
    await clickEngineHandoffButton(page, "Export Engine Package ZIP");
    const enginePackageDownload = await enginePackageDownloadPromise;
    expect(enginePackageDownload.suggestedFilename()).toBe("Engine-Export-Draft.agm-engine-package.zip");
    const enginePackagePath = await enginePackageDownload.path();
    expect(enginePackagePath).toBeTruthy();
    const enginePackage = await fs.readFile(enginePackagePath!);
    expect(enginePackage.length).toBeGreaterThan(256);
    expect(Array.from(enginePackage.subarray(0, 2))).toEqual([0x50, 0x4b]);
    const enginePackageEntries = await page.evaluate(async (bytes: number[]) => {
      const JsZip = (window as any).JSZip;
      if (!JsZip) throw new Error("JSZip is unavailable for Engine Package validation");
      const zip = await JsZip.loadAsync(new Uint8Array(bytes));
      const names = Object.keys(zip.files).filter(name => !zip.files[name].dir).sort();
      const readText = (name: string) => zip.file(name)?.async("string");
      const readUint8 = (name: string) => zip.file(name)?.async("uint8array");
      const manifestPath = "manifest/Engine-Export-Draft.agm-engine-manifest.json";
      const sampleMetadataPath = "handoff/importer-sample-metadata.json";
      const heightfieldPath = "terrain/Engine-Export-Draft.agm-heightfield.json";
      const raw16Path = "terrain/Engine-Export-Draft.agm-heightmap-r16.raw";
      const handoffReadmePath = "handoff/README.md";
      const unityReadmePath = "handoff/importers/unity/README.md";
      const godotReadmePath = "handoff/importers/godot/README.md";
      const godotStubPath = "handoff/importers/godot/agm_importer_stub.gd.txt";
      const unrealReadmePath = "handoff/importers/unreal/README.md";
      const unrealStubPath = "handoff/importers/unreal/AgmImporterStub.cpp.txt";
      const unityStubPath = "handoff/importers/unity/AgmImporterStub.cs.txt";
      const unityRuntimeImporterPath = "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt";
      const unityPackageLayoutPath = "handoff/importers/unity/package-layout.json";
      const unityAuthoringPrototypePath = "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt";
      const manifestText = await readText(manifestPath);
      const sampleMetadataText = await readText(sampleMetadataPath);
      const handoffReadmeText = await readText(handoffReadmePath);
      const unityReadmeText = await readText(unityReadmePath);
      const godotReadmeText = await readText(godotReadmePath);
      const godotStubText = await readText(godotStubPath);
      const unrealReadmeText = await readText(unrealReadmePath);
      const unrealStubText = await readText(unrealStubPath);
      const heightfieldText = await readText(heightfieldPath);
      const unityStubText = await readText(unityStubPath);
      const unityRuntimeImporterText = await readText(unityRuntimeImporterPath);
      const unityPackageLayoutText = await readText(unityPackageLayoutPath);
      const unityAuthoringPrototypeText = await readText(unityAuthoringPrototypePath);
      const raw16Bytes = await readUint8(raw16Path);
      if (!manifestText || !sampleMetadataText || !handoffReadmeText || !unityReadmeText || !godotReadmeText || !godotStubText || !unrealReadmeText || !unrealStubText || !heightfieldText || !unityStubText || !unityRuntimeImporterText || !unityPackageLayoutText || !unityAuthoringPrototypeText || !raw16Bytes) throw new Error("Engine Package validation entries are missing");
      const manifest = JSON.parse(manifestText);
      const sampleMetadata = JSON.parse(sampleMetadataText);
      const heightfield = JSON.parse(heightfieldText);
      const unityPackageLayout = JSON.parse(unityPackageLayoutText);
      const unitySample = sampleMetadata.engineSamples.find((sample: any) => sample.engine === "unity");

      return {
        names,
        manifest,
        sampleMetadata,
        handoffReadmeText,
        unityReadmeText,
        godotReadmeText,
        godotStubText,
        unrealReadmeText,
        unrealStubText,
        heightfieldValueCount: heightfield.values.length,
        raw16Length: raw16Bytes.length,
        unitySample,
        unityStubText,
        unityRuntimeImporterText,
        unityAuthoringPrototypeText,
        unityPackageLayout,
      };
    }, Array.from(enginePackage));
    expect(enginePackageEntries.names).toEqual(expect.arrayContaining(["manifest/Engine-Export-Draft.agm-engine-manifest.json", "maps/Engine-Export-Draft.agm-world.json", "maps/Engine-Export-Draft.agm-resource-map.json", "maps/Engine-Export-Draft.agm-province-map.json", "maps/Engine-Export-Draft.agm-biome-map.json", "terrain/Engine-Export-Draft.agm-heightmap.json", "terrain/Engine-Export-Draft.agm-heightfield.json", "terrain/Engine-Export-Draft.agm-heightmap-r16.raw", "handoff/README.md", "handoff/importer-sample-metadata.json", "handoff/importers/unity/README.md", "handoff/importers/godot/README.md", "handoff/importers/godot/agm_importer_stub.gd.txt", "handoff/importers/unreal/README.md", "handoff/importers/unreal/AgmImporterStub.cpp.txt", "handoff/importers/unity/AgmImporterStub.cs.txt", "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "handoff/importers/unity/package-layout.json"]));
    expect(enginePackageEntries.manifest.artifactContract).toEqual(expectedArtifactContract);
    expect(enginePackageEntries.manifest.importerHandoff).toEqual(expect.objectContaining({artifactContract: expectedArtifactContract, noPluginIncluded: true, layout: expect.objectContaining({requiredFiles: expect.any(Array), optionalFiles: expect.any(Array), engineArtifactFiles: expect.any(Array)}), bridgeValidation: expect.objectContaining({engine: "unity", status: "zip-content-e2e-validated", runtimeValidated: false}), unityRuntimeImporterSpike: expect.objectContaining({status: "source-sample-included", runtimeValidated: false, editorValidated: false, createsUnityProject: false, dependencyPolicy: "unity-builtins-only"}), unityValidationHarness: expect.objectContaining({status: "available", scriptPath: "scripts/validate-unity-export.mjs", unityCliValidation: "optional-batchmode-terrain-prototype-check", batchmodeMethod: "AgmValidationBatchmode.Run", importerSmokeTest: "AgmRuntimePackageImporter.ImportFromUnpackedPackage", prototypeReport: "Assets/AGM/Validation/agm-imported-package-report.json", terrainPrototypeReport: "terrainPrototype", prototypeValidation: "metadata-json-only", reportSchema: "agm.unity-validation-report.v0", runtimeValidated: false, editorValidated: false, createsUnityProject: false})}));
    expect(enginePackageEntries.names).toEqual(expect.arrayContaining(enginePackageEntries.manifest.importerHandoff.layout.requiredFiles));
    expect(enginePackageEntries.names).toEqual(expect.arrayContaining(enginePackageEntries.manifest.importerHandoff.layout.engineArtifactFiles));
    expect(enginePackageEntries.handoffReadmeText).toContain("Quick handoff");
    expect(enginePackageEntries.handoffReadmeText).toContain("快速交接");
    expect(enginePackageEntries.handoffReadmeText).toContain("npm run validate:unity-export -- --dir");
    expect(enginePackageEntries.handoffReadmeText).toContain("source samples");
    expect(enginePackageEntries.handoffReadmeText).toContain("no production plugin");
    expect(enginePackageEntries.handoffReadmeText).toContain("--zip");
    expect(enginePackageEntries.handoffReadmeText).toContain("not implemented");
    expect(enginePackageEntries.handoffReadmeText).toContain("Unity-first vertical slice prototype");
    expect(enginePackageEntries.handoffReadmeText).toContain("metadata-only terrain/map-layer importer reports");
    expect(enginePackageEntries.handoffReadmeText).toContain("Unity importer asset authoring source sample");
    expect(enginePackageEntries.handoffReadmeText).toContain("can create temporary TerrainData, ScriptableObject, and prefab prototype assets only inside the validator Unity project");
    expect(enginePackageEntries.manifest.importerHandoff.unityVerticalSlicePrototype).toEqual(expect.objectContaining({status: "source-sample-prototype", outputKind: "metadata-json-only", productionPluginIncluded: false, createsUnityTerrainAsset: false, createsScriptableObjectAsset: false, runtimeValidated: false, editorValidated: false}));
    expect(enginePackageEntries.manifest.importerHandoff.unityAssetAuthoringSpike).toEqual(expect.objectContaining({status: "editor-source-sample-prototype", schema: "agm.unity-asset-authoring-plan.v0", sourceScript: "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", outputKind: "temporary-unity-project-editor-artifacts", outputScope: "validator-temp-unity-project-only", reportBlock: "assetAuthoringPrototype", exportedAssetsIncluded: false, createsUnityTerrainAssetInExport: false, createsScriptableObjectAssetInExport: false, createsPrefabAssetInExport: false, createsUnityPackage: false, productionPluginIncluded: false, runtimeValidated: false, editorValidated: false}));
    expect(enginePackageEntries.manifest.importerHandoff.unityVerticalSlicePrototype.scope).toEqual(expect.arrayContaining(["artifact-contract", "package-layout", "terrain-raw16", "heightfield-grid", "resource-map-layer", "province-map-layer", "biome-map-layer", "prototype-json-report"]));
    expect(enginePackageEntries.manifest.importerHandoff.unityValidationHarness.checks).toEqual(expect.arrayContaining(["unity-contract-consumed", "unity-package-layout-consumed", "unity-map-layer-records", "unity-map-layer-summaries", "unity-prototype-report-contract", "unity-prototype-non-asset-output", "unity-asset-authoring-spike-metadata", "unity-asset-authoring-report", "unity-asset-authoring-non-asset-output", "unity-forbidden-editor-apis-absent"]));
    expect(enginePackageEntries.manifest.importerHandoff.unityImporterArtifactPaths).toEqual(expect.arrayContaining(["handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", "handoff/importers/unity/package-layout.json"]));
    expect(enginePackageEntries.manifest.importerHandoff.sampleStubPaths.find((stub: any) => stub.engine === "unity").paths).toEqual(expect.arrayContaining(["handoff/importers/unity/README.md", "handoff/importers/unity/AgmImporterStub.cs.txt", "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt"]));
    expect(enginePackageEntries.manifest.engineProfiles.find((profile: any) => profile.engine === "unity")).toEqual(expect.objectContaining({heightRawStatus: "raw-uint16-little-endian"}));
    expect(enginePackageEntries.sampleMetadata.artifactContract).toEqual(expectedArtifactContract);
    expect(enginePackageEntries.sampleMetadata.productionPluginBoundary).toEqual(expectedProductionPluginBoundary);
    expect(enginePackageEntries.sampleMetadata.unityProductionImporterPackagingPlan).toEqual(expectedUnityProductionImporterPackagingPlan);
    expect(enginePackageEntries.sampleMetadata.godotProductionImporterPackagingPlan).toEqual(expectedGodotProductionImporterPackagingPlan);
    expect(enginePackageEntries.sampleMetadata.unrealProductionImporterPackagingPlan).toEqual(expectedUnrealProductionImporterPackagingPlan);
    expect(enginePackageEntries.sampleMetadata.realEngineSmokeRecords).toEqual(expectedRealEngineSmokeRecords);
    expect(enginePackageEntries.sampleMetadata.importerStatus).toEqual(expect.objectContaining({productionPluginBoundaryStatus: "source-sample-and-validation-prototype-only"}));
    expect(enginePackageEntries.sampleMetadata.handoffDocs.language).toEqual(expect.arrayContaining(["en", "zh-CN"]));
    expect(enginePackageEntries.sampleMetadata.handoffDocs.quickStart.en).toEqual(expect.arrayContaining([expect.stringContaining("Export Engine Package ZIP"), expect.stringContaining("validate:unity-export")]));
    expect(enginePackageEntries.sampleMetadata.handoffDocs.quickStart.zhCN).toEqual(expect.arrayContaining([expect.stringContaining("导出"), expect.stringContaining("校验")]));
    expect(enginePackageEntries.sampleMetadata.validationCommands).toEqual(expect.objectContaining({extractedDirectory: expect.stringContaining("--dir"), zipDirectValidation: "not-implemented"}));
    expect(enginePackageEntries.sampleMetadata.importerStatus).toEqual(expect.objectContaining({bridgeValidation: "unity-zip-content-e2e-validated", stubStatus: "sample-text-only"}));
    expect(enginePackageEntries.sampleMetadata.unityRuntimeImporter).toEqual(expect.objectContaining({entryScript: "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", typeDefinitions: "handoff/importers/unity/Runtime/AgmPackageTypes.cs.txt", editorMenuSample: "handoff/importers/unity/Editor/AgmImportMenu.cs.txt", packageLayout: "handoff/importers/unity/package-layout.json", notValidatedInUnity: true}));
    expect(enginePackageEntries.sampleMetadata.unityVerticalSlicePrototype).toEqual(expect.objectContaining({sourceStatus: "source-sample-prototype", runtimeValidated: false, editorValidated: false}));
    expect(enginePackageEntries.sampleMetadata.unityVerticalSlicePrototype.consumes).toEqual(expect.objectContaining({artifactContract: "manifest/Engine-Export-Draft.agm-engine-manifest.json", packageLayout: "handoff/importers/unity/package-layout.json", sampleMetadata: "handoff/importer-sample-metadata.json"}));
    expect(enginePackageEntries.sampleMetadata.unityVerticalSlicePrototype.consumes.mapLayers).toEqual({resource: "maps/Engine-Export-Draft.agm-resource-map.json", province: "maps/Engine-Export-Draft.agm-province-map.json", biome: "maps/Engine-Export-Draft.agm-biome-map.json"});
    expect(enginePackageEntries.sampleMetadata.unityVerticalSlicePrototype.emits).toEqual(expect.objectContaining({report: "Assets/AGM/Validation/agm-imported-package-report.json", terrainPrototype: "terrainPrototype", mapLayerPrototype: "mapLayerPrototype", artifactContractPrototype: "artifactContractPrototype", prototypeOutput: "prototypeOutput"}));
    expect(enginePackageEntries.sampleMetadata.unityVerticalSlicePrototype.limitations).toEqual(expect.arrayContaining(["metadata-json-only", "no Unity Terrain asset", "no ScriptableObject asset", "no production plugin", "extracted-directory-only"]));
    expect(enginePackageEntries.sampleMetadata.unityAssetAuthoringSpike).toEqual(expect.objectContaining({status: "editor-source-sample-prototype", schema: "agm.unity-asset-authoring-plan.v0", sourceScript: "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt", outputKind: "temporary-unity-project-editor-artifacts", outputScope: "validator-temp-unity-project-only", reportBlock: "assetAuthoringPrototype", outputReportBlock: "assetAuthoringPrototype", assetRoot: "Assets/AGM/Validation/EditorPrototypeAssets", exportedAssetsIncluded: false, validatorTempProjectCreatesAssets: true, createsUnityTerrainAssetInExport: false, createsScriptableObjectAssetInExport: false, createsPrefabAssetInExport: false, createsUnityPackage: false, productionPluginIncluded: false, runtimeValidated: false, editorValidated: false}));
    expect(enginePackageEntries.sampleMetadata.unityAssetAuthoringSpike.intendedArtifacts.every((artifact: any) => artifact.exportedAssetIncluded === false && artifact.validatorTempProjectCreatesAsset === true)).toBe(true);
    expect(enginePackageEntries.sampleMetadata.unityValidationHarness).toEqual(expect.objectContaining({scriptPath: "scripts/validate-unity-export.mjs", mode: "local-structure-validation-with-optional-unity-cli", defaultValidation: "structure-only", unityCliValidation: "optional-batchmode-terrain-prototype-check", batchmodeMethod: "AgmValidationBatchmode.Run", importerSmokeTest: "AgmRuntimePackageImporter.ImportFromUnpackedPackage", prototypeReport: "Assets/AGM/Validation/agm-imported-package-report.json", terrainPrototypeReport: "terrainPrototype", prototypeValidation: "metadata-json-only", runtimeValidated: false, editorValidated: false, reportSchema: "agm.unity-validation-report.v0"}));
    expect(enginePackageEntries.sampleMetadata.expectedOutputs).toEqual(expect.objectContaining({terrainHeightSamples: expect.any(String), heightfieldGrid: expect.any(String), resourceLayerRecords: expect.any(String), provinceLayerRecords: expect.any(String), biomeLayerRecords: expect.any(String), resourceLayerSummary: expect.any(String), provinceLayerSummary: expect.any(String), biomeLayerSummary: expect.any(String), artifactContractPrototype: expect.any(String), unityPrototypeReport: expect.any(String), assetAuthoringPrototype: expect.any(String), manifestSummary: expect.any(String)}));
    expect(enginePackageEntries.unitySample).toEqual(expect.objectContaining({terrainTargetPath: "Terrain/Engine-Export-Draft.agm-heightmap-r16.raw", sampleStubPaths: expect.arrayContaining(["handoff/importers/unity/AgmImporterStub.cs.txt", "handoff/importers/unity/Runtime/AgmRuntimePackageImporter.cs.txt", "handoff/importers/unity/Editor/AgmAssetAuthoringPrototype.cs.txt"])}));
    for (const readmeText of [enginePackageEntries.unityReadmeText, enginePackageEntries.godotReadmeText, enginePackageEntries.unrealReadmeText]) {
      expect(readmeText).toContain("source sample");
      expect(readmeText).toContain("not a production plugin");
      expect(readmeText).toContain("源码示例");
    }
    expect(enginePackageEntries.godotReadmeText).toContain("Production addon review target: addons/agm_importers_godot");
    expect(enginePackageEntries.godotReadmeText).toContain("plugin.cfg and production .gd files are intentionally not bundled");
    expect(enginePackageEntries.godotReadmeText).toContain("source sample reads manifest JSON, importer sample metadata, heightfield JSON, RAW16 little-endian height samples");
    expect(enginePackageEntries.godotReadmeText).toContain("resource/province/biome map layer record counts");
    expect(enginePackageEntries.godotReadmeText).toContain("Godot Resource output, PackedScene output, plugin.cfg, production .gd files, and EditorImportPlugin registration remain release-candidate work");
    expect(enginePackageEntries.godotStubText).toContain("AGM_IMPORTER_CONTRACT");
    expect(enginePackageEntries.godotStubText).toContain("agm.godot-importer-source-sample.v0");
    expect(enginePackageEntries.godotStubText).toContain("PRODUCTION_ADDON_INCLUDED := false");
    expect(enginePackageEntries.godotStubText).toContain("CREATES_GODOT_RESOURCES := false");
    expect(enginePackageEntries.godotStubText).toContain("CREATES_PACKED_SCENES := false");
    expect(enginePackageEntries.godotStubText).toContain("JSON.parse_string");
    expect(enginePackageEntries.godotStubText).toContain("_decode_raw16_little_endian");
    expect(enginePackageEntries.godotStubText).toContain("raw16_samples.size() != height_values.size()");
    expect(enginePackageEntries.godotStubText).toContain("resource_map.get(\"tiles\", []).size()");
    expect(enginePackageEntries.godotStubText).toContain("province_map.get(\"tiles\", []).size()");
    expect(enginePackageEntries.godotStubText).toContain("biome_map.get(\"biomes\", []).size()");
    expect(enginePackageEntries.godotStubText).toContain("FileAccess.open");
    expect(enginePackageEntries.godotStubText).toContain("PackedByteArray");
    expect(enginePackageEntries.godotStubText).not.toContain("EditorImportPlugin");
    expect(enginePackageEntries.godotStubText).not.toContain("ResourceSaver.save");
    expect(enginePackageEntries.godotStubText).not.toContain("PackedScene");
    expect(enginePackageEntries.names).not.toEqual(expect.arrayContaining(["addons/agm_importers_godot/plugin.cfg", "addons/agm_importers_godot/agm_importer.gd"]));
    expect(enginePackageEntries.names.some((name: string) => name.startsWith("addons/agm_importers_godot/") && (name.endsWith(".gd") || name.endsWith(".tscn") || name.endsWith(".tres") || name.endsWith(".res")))).toBe(false);
    expect(enginePackageEntries.unrealReadmeText).toContain("Production plugin review target: Plugins/AGMImportersUnreal");
    expect(enginePackageEntries.unrealReadmeText).toContain(".uplugin, Build.cs, production .cpp/.h files, and cooked Unreal assets are intentionally not bundled");
    expect(enginePackageEntries.unrealReadmeText).toContain("source sample reads manifest JSON, importer sample metadata, heightfield JSON, RAW16 little-endian height samples");
    expect(enginePackageEntries.unrealReadmeText).toContain("resource/province/biome map layer record counts");
    expect(enginePackageEntries.unrealReadmeText).toContain("Unreal asset output, UObject authoring, ImportFactory registration, .uasset output, and production plugin packaging remain release-candidate work");
    expect(enginePackageEntries.unrealStubText).toContain("FAgmImporterSummary");
    expect(enginePackageEntries.unrealStubText).toContain("SampleMetadataPath");
    expect(enginePackageEntries.unrealStubText).toContain("HeightfieldPath");
    expect(enginePackageEntries.unrealStubText).toContain("DecodeRaw16LittleEndian");
    expect(enginePackageEntries.unrealStubText).toContain("Raw16Samples.Num() != HeightSampleCount");
    expect(enginePackageEntries.unrealStubText).toContain("ResourceRecords");
    expect(enginePackageEntries.unrealStubText).toContain("ProvinceRecords");
    expect(enginePackageEntries.unrealStubText).toContain("BiomeRecords");
    expect(enginePackageEntries.unrealStubText).toContain("CountJsonArrayItems");
    expect(enginePackageEntries.unrealStubText).toContain("FFileHelper::LoadFileToString");
    expect(enginePackageEntries.unrealStubText).toContain("FFileHelper::LoadFileToArray");
    expect(enginePackageEntries.unrealStubText).not.toContain("UFactory");
    expect(enginePackageEntries.unrealStubText).not.toContain("UObject");
    expect(enginePackageEntries.unrealStubText).not.toContain("CreatePackage");
    expect(enginePackageEntries.unrealStubText).not.toContain("UPackage::SavePackage");
    expect(enginePackageEntries.unrealStubText).not.toContain(".uplugin");
    expect(enginePackageEntries.names).not.toEqual(expect.arrayContaining(["Plugins/AGMImportersUnreal/AGMImportersUnreal.uplugin"]));
    expect(enginePackageEntries.names.some((name: string) => name.startsWith("Plugins/AGMImportersUnreal/") || name.endsWith(".uasset") || name.endsWith(".umap") || name.endsWith(".Build.cs"))).toBe(false);
    expect(enginePackageEntries.unityStubText).toContain("File.ReadAllText");
    expect(enginePackageEntries.unityStubText).toContain("File.ReadAllBytes");
    expect(enginePackageEntries.unityStubText).toContain("manifest/Engine-Export-Draft.agm-engine-manifest.json");
    expect(enginePackageEntries.unityStubText).toContain("terrain/Engine-Export-Draft.agm-heightmap-r16.raw");
    expect(enginePackageEntries.unityStubText).toContain("UInt16 little-endian");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ReadAllBytes");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("DecodeUInt16LittleEndian");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("little-endian");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("heightfieldSampleCount * 2");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("GridWidth");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("GridHeight");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("Raw16MinSample");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("Raw16MaxSample");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("SampleSpacing");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ResourceLayerPath");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ProvinceLayerPath");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("BiomeLayerPath");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("package-layout.json");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ReadBoolAfter");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("CountArrayItems");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ResourceLayerRecordCount");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ProvinceLayerRecordCount");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("BiomeLayerRecordCount");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ArtifactContractSchema");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ProductionPluginIncluded");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("ValidationMode");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("coverageSummary");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("structureSummary");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("habitabilitySummary");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("AssetAuthoringPlanSchema");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("AssetAuthoringOutputKind");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("AssetAuthoringReportBlock");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("CreatesPrefabAsset");
    expect(enginePackageEntries.unityRuntimeImporterText).toContain("UsesAssetDatabaseCreateAsset");
    expect(enginePackageEntries.unityRuntimeImporterText).not.toContain("AssetDatabase.CreateAsset(");
    expect(enginePackageEntries.unityRuntimeImporterText).not.toContain("ScriptableObject.CreateInstance(");
    expect(enginePackageEntries.unityRuntimeImporterText).not.toContain("UnityEditor.PackageManager");
    expect(enginePackageEntries.unityRuntimeImporterText).not.toContain("PrefabUtility.SaveAsPrefabAsset(");
    expect(enginePackageEntries.unityAuthoringPrototypeText).toContain("ScriptableObject.CreateInstance(");
    expect(enginePackageEntries.unityAuthoringPrototypeText).toContain("AssetDatabase.CreateAsset(");
    expect(enginePackageEntries.unityAuthoringPrototypeText).toContain("PrefabUtility.SaveAsPrefabAsset(");
    expect(enginePackageEntries.unityAuthoringPrototypeText).not.toContain("UnityEditor.PackageManager");
    expect(enginePackageEntries.unityAuthoringPrototypeText).not.toContain("AssetDatabase.ExportPackage(");
    expect(enginePackageEntries.names.some((name: string) => name.endsWith(".asset") || name.endsWith(".prefab") || name.endsWith(".unitypackage") || name.endsWith(".cs") || name === "handoff/importers/unity/package.json" || name.endsWith("/package.json"))).toBe(false);
    expect(enginePackageEntries.unityPackageLayout).toEqual(expect.objectContaining({schema: "agm.unity-package-layout.v0", contractSchema: "agm.engine-package-contract.v0", packageFormat: "agm.engine-package.v0", layoutVersion: 0, manifestPath: "manifest/Engine-Export-Draft.agm-engine-manifest.json", sampleMetadataPath: "handoff/importer-sample-metadata.json", engine: "unity", root: "Assets/AGM/Engine-Export-Draft", sourceStatus: "source-sample-included", productionPluginIncluded: false, productionPluginBoundary: expectedProductionPluginBoundary, unityProductionImporterPackagingPlan: expectedUnityProductionImporterPackagingPlan, zipParsingSupported: false, validationMode: "extracted-directory-only", requiredPackageFiles: enginePackageEntries.manifest.importerHandoff.layout.requiredFiles, runtimeValidated: false, editorValidated: false, createsUnityProject: false, createsUnityTerrainAsset: false, createsScriptableObjectAsset: false, createsPrefabAsset: false, exportedAssetsIncluded: false, createsUnityTerrainAssetInExport: false, createsScriptableObjectAssetInExport: false, createsPrefabAssetInExport: false, createsUnityPackage: false, prototypeOutputKind: "metadata-json-only", assetAuthoringSpikeStatus: "editor-source-sample-prototype", assetAuthoringOutputKind: "temporary-unity-project-editor-artifacts", assetAuthoringOutputScope: "validator-temp-unity-project-only", assetAuthoringAssetRoot: "Assets/AGM/Validation/EditorPrototypeAssets", assetAuthoringReportBlock: "assetAuthoringPrototype", directories: expect.arrayContaining(["Runtime", "Editor", "Terrain", "Maps"])}));
    expect(enginePackageEntries.raw16Length).toBe(enginePackageEntries.heightfieldValueCount * 2);
  });

  test("exports a Tiled map JSON file from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");

    await nameInput.fill("Tiled Export Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("strategy");

    await openExportWorkspace(page);
    await expect(page.locator(".studio-sidebar--right")).toContainText("Map layers");
    const downloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export Tiled Map JSON"}).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Tiled-Export-Draft.agm-tiled-map.json");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const tiledMap = JSON.parse(await fs.readFile(downloadPath!, "utf8"));
    expect(tiledMap).toMatchObject({
      type: "map",
      orientation: "orthogonal",
      renderorder: "right-down",
      tilewidth: 1,
      tileheight: 1,
      infinite: false,
      layers: expect.any(Array),
      tilesets: expect.any(Array),
      properties: expect.any(Array),
    });
    expect(tiledMap.width).toBeGreaterThan(0);
    expect(tiledMap.height).toBeGreaterThan(0);
    expect(tiledMap.layers.map((layer: any) => layer.name)).toEqual(expect.arrayContaining(["Resources", "Provinces", "Biomes"]));
    for (const layer of tiledMap.layers) {
      expect(layer).toEqual(expect.objectContaining({type: "tilelayer", width: tiledMap.width, height: tiledMap.height, data: expect.any(Array), properties: expect.any(Array)}));
      expect(layer.data.length).toBe(tiledMap.width * tiledMap.height);
    }
    expect(tiledMap.tilesets[0]).toEqual(expect.objectContaining({firstgid: 1, name: "AGM semantic map layers", tilecount: 9, tiles: expect.any(Array)}));
    expect(tiledMap.tilesets[0].tiles).toEqual(expect.arrayContaining([
      expect.objectContaining({type: "starter-resource"}),
      expect.objectContaining({type: "primary-connector"}),
      expect.objectContaining({type: "high-friction-biome"}),
    ]));
    expect(tiledMap.properties).toEqual(expect.arrayContaining([
      expect.objectContaining({name: "agmSchema", value: "agm.package.v0"}),
      expect.objectContaining({name: "profile", value: "strategy"}),
    ]));
  });

  test("exports independent map layer JSON files from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");

    await nameInput.fill("Map Layer Export Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("strategy");

    await openExportWorkspace(page);
    await expect(page.locator(".studio-sidebar--right")).toContainText("Map layers");

    const resourceDownloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export Resource Map JSON"}).click();
    const resourceDownload = await resourceDownloadPromise;
    expect(resourceDownload.suggestedFilename()).toBe("Map-Layer-Export-Draft.agm-resource-map.json");
    const resourceDownloadPath = await resourceDownload.path();
    expect(resourceDownloadPath).toBeTruthy();
    const resourceMap = JSON.parse(await fs.readFile(resourceDownloadPath!, "utf8"));
    expect(resourceMap).toMatchObject({schema: "agm.resource-map.v0", profile: "strategy", tiles: expect.any(Array), coverageSummary: expect.any(Object)});
    expect(resourceMap.tiles[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^resource-tile-/), provinceId: expect.any(Number), resourceTag: expect.any(String)}));

    const provinceDownloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export Province Map JSON"}).click();
    const provinceDownload = await provinceDownloadPromise;
    expect(provinceDownload.suggestedFilename()).toBe("Map-Layer-Export-Draft.agm-province-map.json");
    const provinceDownloadPath = await provinceDownload.path();
    expect(provinceDownloadPath).toBeTruthy();
    const provinceMap = JSON.parse(await fs.readFile(provinceDownloadPath!, "utf8"));
    expect(provinceMap).toMatchObject({schema: "agm.province-map.v0", profile: "strategy", tiles: expect.any(Array), structureSummary: expect.any(Object)});
    expect(provinceMap.tiles[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^province-tile-/), provinceId: expect.any(Number), provinceName: expect.any(String), structureScore: expect.any(Number)}));

    const biomeDownloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export Biome Map JSON"}).click();
    const biomeDownload = await biomeDownloadPromise;
    expect(biomeDownload.suggestedFilename()).toBe("Map-Layer-Export-Draft.agm-biome-map.json");
    const biomeDownloadPath = await biomeDownload.path();
    expect(biomeDownloadPath).toBeTruthy();
    const biomeMap = JSON.parse(await fs.readFile(biomeDownloadPath!, "utf8"));
    expect(biomeMap).toMatchObject({schema: "agm.biome-map.v0", profile: "strategy", legend: expect.any(Array), biomes: expect.any(Array), habitabilitySummary: expect.any(Object)});
    expect(biomeMap.biomes[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^biome-tile-/), biomeId: expect.any(Number), biomeName: expect.any(String), resourceTag: expect.any(String)}));
  });

  test("exports a JSON world package file from Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const designIntent = "Export a game-ready package with indexed states and settlements";

    await nameInput.fill("Playable Package Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("strategy");
    await designIntentInput.fill(designIntent);
    await designIntentInput.blur();
    await expect(page.locator("#studioProjectWorldJsonDraft")).toContainText(designIntent);
    await openProjectGenerationDetails(page);
    await expect(page.locator("#studioGeneratorProfileSuggestions")).toContainText("Profile generator suggestions");
    await expect(page.locator("#studioGeneratorProfileSuggestions")).toContainText("balanced-starts");
    await expect(page.locator("#studioGeneratorProfileSuggestions")).toContainText("Spawn fairness weight");
    await fillGeneratorParameter(page, "spawnFairnessWeight", "1.8");
    await fillGeneratorParameter(page, "routeConnectivityScore", "90");
    await fillGeneratorParameter(page, "settlementDensityTarget", "8");
    await fillGeneratorParameter(page, "biomeFrictionWeight", "1.4");
    await fillGeneratorParameter(page, "resourceCoverageTarget", "72");
    await expect(page.locator("#studioGeneratorProfileSuggestions")).toContainText("override: custom");
    await expect.poll(() =>
      page.locator("#studioProjectWorldJsonDraft").textContent().then(text => {
        const draft = JSON.parse(text || "{}");
        return {
          overrideValue: draft.generation.profileOverrides.values.spawnFairnessWeight,
          routeOverrideValue: draft.generation.profileOverrides.values.routeConnectivityScore,
          settlementOverrideValue: draft.generation.profileOverrides.values.settlementDensityTarget,
          biomeOverrideValue: draft.generation.profileOverrides.values.biomeFrictionWeight,
          resourceOverrideValue: draft.generation.profileOverrides.values.resourceCoverageTarget,
          suggestionValue: draft.playability.generatorProfileSuggestions.find((suggestion: any) => suggestion.parameterDraft.key === "spawnFairnessWeight")?.parameterDraft.value,
          routeSuggestionValue: draft.playability.generatorProfileSuggestions.find((suggestion: any) => suggestion.parameterDraft.key === "routeConnectivityScore")?.parameterDraft.value,
          settlementSuggestionValue: draft.playability.generatorProfileSuggestions.find((suggestion: any) => suggestion.parameterDraft.key === "settlementDensityTarget")?.parameterDraft.value,
          biomeSuggestionValue: draft.playability.generatorProfileSuggestions.find((suggestion: any) => suggestion.parameterDraft.key === "biomeFrictionWeight")?.parameterDraft.value,
          resourceSuggestionValue: draft.playability.generatorProfileSuggestions.find((suggestion: any) => suggestion.parameterDraft.key === "resourceCoverageTarget")?.parameterDraft.value,
        };
      }),
    ).toEqual({overrideValue: 1.8, routeOverrideValue: 90, settlementOverrideValue: 8, biomeOverrideValue: 1.4, resourceOverrideValue: 72, suggestionValue: 1.8, routeSuggestionValue: 90, settlementSuggestionValue: 8, biomeSuggestionValue: 1.4, resourceSuggestionValue: 72});

    await openExportWorkspace(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export AGM World JSON"}).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("Playable-Package-Draft.agm-world.json");
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const exportedPackage = JSON.parse(await fs.readFile(downloadPath!, "utf8"));
    expect(exportedPackage).toMatchObject({
      schema: "agm.package.v0",
      manifest: {
        id: "Playable-Package-Draft",
        name: "Playable Package Draft",
        profile: "strategy",
        profileLabel: "Strategy campaign map",
        sourceSchema: "agm.world.v0",
      },
      map: {
        seed: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        style: expect.any(String),
        heightmap: expect.any(String),
      },
      maps: {
        resourceMap: expect.objectContaining({
          schema: "agm.resource-map.v0",
          profile: "strategy",
          profileLabel: "Strategy campaign map",
          sourceRules: expect.any(Array),
          legend: expect.any(Array),
          tiles: expect.any(Array),
          coverageSummary: expect.any(Object),
        }),
        provinceMap: expect.objectContaining({
          schema: "agm.province-map.v0",
          profile: "strategy",
          profileLabel: "Strategy campaign map",
          sourceRules: expect.any(Array),
          tiles: expect.any(Array),
          structureSummary: expect.any(Object),
        }),
        biomeMap: expect.objectContaining({
          schema: "agm.biome-map.v0",
          profile: "strategy",
          profileLabel: "Strategy campaign map",
          sourceRules: expect.any(Array),
          legend: expect.any(Array),
          biomes: expect.any(Array),
          habitabilitySummary: expect.any(Object),
        }),
      },
      indexes: {
        states: expect.any(Array),
        burgs: expect.any(Array),
        cultures: expect.any(Array),
        religions: expect.any(Array),
        biomes: expect.any(Array),
        provinces: expect.any(Array),
        routes: expect.any(Array),
      },
      entities: {
        states: expect.any(Array),
        burgs: expect.any(Array),
        cultures: expect.any(Array),
        religions: expect.any(Array),
      },
      resources: {
        biomes: expect.any(Array),
        provinces: expect.any(Array),
        routes: expect.any(Array),
      },
      generation: {
        profileOverrides: {
          profile: "strategy",
          values: expect.objectContaining({spawnFairnessWeight: 1.8, settlementDensityTarget: 8, routeConnectivityScore: 90, biomeFrictionWeight: 1.4, resourceCoverageTarget: 72}),
        },
      },
      rules: {
        schema: "agm.rules.v0",
        version: 1,
        source: "agm-biome-summary",
        biomeRules: expect.any(Array),
        resourceTags: expect.any(Array),
        provinceStructure: expect.any(Array),
        resourceRules: expect.any(Array),
        profileRules: expect.objectContaining({
          profile: "strategy",
          profileLabel: "Strategy campaign map",
          priorities: expect.any(Array),
          sourceFields: expect.arrayContaining(["document.gameProfile", "resources.provinces", "resources.routes", "resources.biomes.agmResourceTag"]),
        }),
        weights: expect.objectContaining({
          defaultRuleWeight: 1,
          ruleWeightRange: {min: 0, max: 5},
          sourceFields: expect.arrayContaining(["resources.biomes.habitability", "resources.biomes.agmRuleWeight", "resources.biomes.agmResourceTag"]),
        }),
      },
      playability: {
        spawnCandidates: expect.any(Array),
        balanceHints: expect.any(Array),
        autoFixDrafts: expect.any(Array),
        appliedPreviewChanges: expect.any(Array),
        generatorProfileSuggestions: expect.any(Array),
        generationProfileImpact: null,
      },
      exportTargets: expect.arrayContaining(["json", "unity", "godot", "unreal", "tiled", "geojson", "heightmap"]),
    });
    expect(exportedPackage.indexes.states.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.burgs.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.cultures.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.religions.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.biomes.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.provinces.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.routes.length).toBeGreaterThan(0);
    expect(exportedPackage.entities.states.length).toBeGreaterThan(0);
    expect(exportedPackage.entities.burgs.length).toBeGreaterThan(0);
    expect(exportedPackage.entities.cultures.length).toBeGreaterThan(0);
    expect(exportedPackage.entities.religions.length).toBeGreaterThan(0);
    expect(exportedPackage.entities.states[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedPackage.entities.burgs[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedPackage.entities.cultures[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedPackage.entities.religions[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedPackage.resources.biomes.length).toBeGreaterThan(0);
    expect(exportedPackage.resources.provinces.length).toBeGreaterThan(0);
    expect(exportedPackage.resources.routes.length).toBeGreaterThan(0);
    expect(exportedPackage.resources.biomes[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String), habitability: expect.any(Number)}));
    expect(exportedPackage.rules.biomeRules.length).toBe(exportedPackage.resources.biomes.length);
    expect(exportedPackage.rules.biomeRules[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^biome-rule-\d+$/), biomeId: expect.any(Number), biomeName: expect.any(String), ruleWeight: expect.any(Number), resourceTag: expect.any(String), source: expect.stringMatching(/^(agm-biome-summary|studio-metadata)$/), profileBiomeFrictionWeight: 1.4, profileAdjustedHabitability: expect.any(Number), profileFrictionBand: "high-friction"}));
    expect(exportedPackage.rules.resourceTags[0]).toEqual(expect.objectContaining({tag: expect.any(String), biomeIds: expect.any(Array), role: expect.stringMatching(/^(starter|challenge|neutral)$/)}));
    expect(exportedPackage.rules.resourceTags.flatMap((tag: any) => tag.biomeIds)).toEqual(expect.arrayContaining([exportedPackage.rules.biomeRules[0].biomeId]));
    expect(exportedPackage.rules.provinceStructure[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^province-structure-/), provinceId: expect.any(Number), stateId: expect.any(Number), hasSettlementAnchor: expect.any(Boolean), profileRouteConnectivityScore: 90, profileResourceCoverageTarget: 72, structureScore: expect.any(Number), connectorPriority: expect.stringMatching(/^(primary-connector|secondary-connector|resource-frontier)$/), routeAnchorIds: expect.any(Array), resourceRuleIds: expect.any(Array)}));
    expect(exportedPackage.rules.resourceRules[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^resource-rule-/), distribution: "biome-tag-derived", provinceIds: expect.any(Array), routeIds: expect.any(Array), coverageScore: expect.any(Number), profileResourceCoverageTarget: 72, profileCoverageDelta: expect.any(Number), profileCoverageBand: expect.stringMatching(/^(under-target|on-target|over-target)$/)}));
    expect(exportedPackage.maps.resourceMap.legend[0]).toEqual(expect.objectContaining({tag: expect.any(String), role: expect.stringMatching(/^(starter|challenge|neutral)$/), priority: expect.stringMatching(/^(start-support|challenge-zone|neutral-coverage)$/), coverageScore: expect.any(Number), profileCoverageBand: expect.stringMatching(/^(under-target|on-target|over-target)$/)}));
    expect(exportedPackage.maps.resourceMap.tiles[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^resource-tile-/), provinceId: expect.any(Number), resourceTag: expect.any(String), role: expect.stringMatching(/^(starter|challenge|neutral)$/), coverageScore: expect.any(Number), structureScore: expect.any(Number), connectorPriority: expect.stringMatching(/^(primary-connector|secondary-connector|resource-frontier)$/), routeAnchorIds: expect.any(Array), exportLayer: expect.stringMatching(/^(starter-resource|challenge-resource|neutral-resource)$/)}));
    expect(exportedPackage.maps.resourceMap.coverageSummary).toEqual(expect.objectContaining({tileCount: exportedPackage.maps.resourceMap.tiles.length, starterTiles: expect.any(Number), challengeTiles: expect.any(Number), neutralTiles: expect.any(Number), averageCoverageScore: expect.any(Number)}));
    expect(exportedPackage.maps.resourceMap.sourceRules).toEqual(expect.arrayContaining([exportedPackage.rules.resourceRules[0].id]));
    expect(exportedPackage.maps.provinceMap.tiles[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^province-tile-/), provinceId: expect.any(Number), provinceName: expect.any(String), stateId: expect.any(Number), hasSettlementAnchor: expect.any(Boolean), structureScore: expect.any(Number), connectorPriority: expect.stringMatching(/^(primary-connector|secondary-connector|resource-frontier)$/), routeAnchorIds: expect.any(Array), resourceRuleIds: expect.any(Array), exportLayer: expect.stringMatching(/^(primary-connector|secondary-connector|resource-frontier)$/)}));
    expect(exportedPackage.maps.provinceMap.structureSummary).toEqual(expect.objectContaining({tileCount: exportedPackage.maps.provinceMap.tiles.length, settlementAnchoredTiles: expect.any(Number), primaryConnectorTiles: expect.any(Number), secondaryConnectorTiles: expect.any(Number), resourceFrontierTiles: expect.any(Number), averageStructureScore: expect.any(Number)}));
    expect(exportedPackage.maps.biomeMap.legend[0]).toEqual(expect.objectContaining({tag: expect.any(String), role: expect.stringMatching(/^(starter|challenge|neutral)$/), biomeIds: expect.any(Array)}));
    expect(exportedPackage.maps.biomeMap.biomes[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^biome-tile-/), biomeId: expect.any(Number), biomeName: expect.any(String), habitability: expect.any(Number), resourceTag: expect.any(String), ruleWeight: expect.any(Number), profileBiomeFrictionWeight: 1.4, profileAdjustedHabitability: expect.any(Number), profileFrictionBand: "high-friction", exportLayer: "high-friction"}));
    expect(exportedPackage.maps.biomeMap.habitabilitySummary).toEqual(expect.objectContaining({biomeCount: exportedPackage.maps.biomeMap.biomes.length, lowFrictionBiomes: expect.any(Number), balancedFrictionBiomes: expect.any(Number), highFrictionBiomes: expect.any(Number), averageAdjustedHabitability: expect.any(Number)}));
    expect(exportedPackage.rules.profileRules.priorities).toEqual(expect.arrayContaining([expect.objectContaining({id: "balanced-starts", target: "spawn"})]));
    const biomeDraft = exportedPackage.playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-biome-habitability");
    expect(biomeDraft.previewDiff.changes[0].fields).toEqual(expect.objectContaining({agmRuleWeight: 1.4, agmResourceTag: expect.stringMatching(/^(starter|challenge)-biome$/), profileBiomeFrictionWeight: 1.4, profileHabitabilityLift: expect.any(Number)}));
    expect(biomeDraft.previewDiff.changes[0].summary).toContain("profile biome friction weight 1.4");
    expect(exportedPackage.resources.provinces[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String), state: expect.any(Number)}));
    expect(exportedPackage.resources.routes[0]).toEqual(expect.objectContaining({id: expect.any(Number), group: expect.any(String), pointCount: expect.any(Number)}));
    expect(exportedPackage.playability.spawnCandidates.length).toBeGreaterThan(0);
    expect(exportedPackage.playability.balanceHints.length).toBeGreaterThan(0);
    expect(exportedPackage.playability.autoFixDrafts.length).toBeGreaterThan(0);
    expect(exportedPackage.playability.appliedPreviewChanges).toEqual([]);
    expect(exportedPackage.playability.generatorProfileSuggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({profile: "strategy", priorityId: "balanced-starts", target: "spawn", weight: expect.any(Number), recommendation: expect.any(String), parameterDraft: expect.objectContaining({key: "spawnFairnessWeight", label: "Spawn fairness weight", value: 1.8, unit: "profile-weight", source: "balanced-starts", overridden: true}), refs: expect.any(Object)}),
        expect.objectContaining({profile: "strategy", target: "settlement", parameterDraft: expect.objectContaining({key: "settlementDensityTarget", value: 8, overridden: true})}),
        expect.objectContaining({profile: "strategy", target: "habitability", parameterDraft: expect.objectContaining({key: "biomeFrictionWeight", value: 1.4, overridden: true})}),
      ]),
    );
    expect(exportedPackage.playability.balanceHints[0]).toEqual(expect.objectContaining({id: "spawn-candidate-coverage", profileWeight: 1.35, profilePriority: "balanced-starts"}));
    expect(exportedPackage.playability.autoFixDrafts[0]).toEqual(expect.objectContaining({id: "auto-fix-spawn-candidate-coverage", profileWeight: 1.35, profilePriority: "balanced-starts"}));
    expect(exportedPackage.playability.spawnCandidates[0]).toEqual(expect.objectContaining({id: expect.stringMatching(/^spawn-/), score: expect.any(Number), reasons: expect.any(Array)}));
    expect(exportedPackage.playability.spawnCandidates[0].reasons).toContain("Profile balanced-starts applies spawn fairness weight 1.8");
    expect(exportedPackage.playability.spawnCandidates[0].reasons.length).toBeGreaterThan(0);
    expect(exportedPackage.playability.balanceHints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: "spawn-candidate-coverage", category: "spawn", severity: expect.stringMatching(/^(info|warning)$/), message: expect.any(String), profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "settlement-distribution", category: "settlement", severity: expect.stringMatching(/^(info|warning)$/), message: expect.any(String), profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "route-connectivity", category: "connectivity", severity: expect.stringMatching(/^(info|warning)$/), message: expect.any(String), profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "biome-habitability", category: "habitability", severity: expect.stringMatching(/^(info|warning)$/), message: expect.any(String), profileWeight: expect.any(Number)}),
      ]),
    );
    expect(exportedPackage.playability.autoFixDrafts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: "auto-fix-spawn-candidate-coverage", hintId: "spawn-candidate-coverage", category: "spawn", action: "expand-spawn-candidate-set", status: "draft", profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "auto-fix-settlement-distribution", hintId: "settlement-distribution", category: "settlement", action: "rebalance-settlement-density", status: "draft", profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "auto-fix-route-connectivity", hintId: "route-connectivity", category: "connectivity", action: "draft-route-connectors", status: "draft", profileWeight: expect.any(Number)}),
        expect.objectContaining({id: "auto-fix-biome-habitability", hintId: "biome-habitability", category: "habitability", action: "tune-habitable-biome-weights", status: "draft", profileWeight: expect.any(Number)}),
      ]),
    );
    expect(exportedPackage.playability.autoFixDrafts[0]).toEqual(expect.objectContaining({summary: expect.any(String), targetRefs: expect.any(Object), steps: expect.any(Array), risks: expect.any(Array)}));
    const settlementDraft = exportedPackage.playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-settlement-distribution");
    const routeDraft = exportedPackage.playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-route-connectivity");
    expect(settlementDraft.previewDiff).toMatchObject({
      mode: "dry-run",
      title: "Settlement density preview",
      changes: expect.arrayContaining([
        expect.objectContaining({
          operation: "create",
          entity: "burg",
          refs: expect.objectContaining({states: expect.any(Array)}),
          fields: expect.objectContaining({
            profileSettlementDensityTarget: 8,
            currentStateSettlementCount: expect.any(Number),
            profileSettlementDensityGap: expect.any(Number),
            supportSettlementLimit: 4,
          }),
        }),
      ]),
    });
    expect(settlementDraft.previewDiff.changes[0].summary).toContain("profile settlement density target 8");
    expect(routeDraft.previewDiff).toMatchObject({
      mode: "dry-run",
      title: "Route connector preview",
      changes: expect.arrayContaining([expect.objectContaining({operation: "link", entity: "route", refs: expect.objectContaining({provinces: expect.any(Array)}), fields: expect.objectContaining({profileRouteConnectivityScore: 90, provinceStructureScore: expect.any(Number), provinceStructurePriority: expect.stringMatching(/^(primary-connector|secondary-connector|resource-frontier)$/), connectorLimit: 6})})]),
    });
    expect(routeDraft.previewDiff.changes[0].summary).toContain("profile connectivity score 90");
    expect(routeDraft.previewDiff.changes[0].summary).toContain("province structure score");
    expect(exportedPackage.playability.autoFixDrafts[0].steps.length).toBeGreaterThan(0);
    expect(exportedPackage.playability.autoFixDrafts[0].risks.length).toBeGreaterThan(0);
    expect(exportedPackage.indexes.states).toContain(exportedPackage.entities.states[0].id);
    expect(exportedPackage.indexes.burgs).toContain(exportedPackage.entities.burgs[0].id);
    expect(exportedPackage.indexes.cultures).toContain(exportedPackage.entities.cultures[0].id);
    expect(exportedPackage.indexes.religions).toContain(exportedPackage.entities.religions[0].id);
    expect(exportedPackage.indexes.biomes).toContain(exportedPackage.resources.biomes[0].id);
    expect(exportedPackage.indexes.provinces).toContain(exportedPackage.resources.provinces[0].id);
    expect(exportedPackage.indexes.routes).toContain(exportedPackage.resources.routes[0].id);
  });

  test("exports and imports an AGM draft file through Project document state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const exportNav = page.locator(".studio-nav [data-studio-action='section'][data-value='export']");

    await canvasNav.click();
    const canvasPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await canvasPanel.locator("#studioInspectorPresetSelect").selectOption("mobile-portrait");
    await canvasPanel.locator("[data-studio-action='orientation'][data-value='portrait']").click();
    await page.locator("[data-studio-action='fitmode'][data-value='cover']").first().click();

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='jpeg']").click();

    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");
    await layersNav.click();
    const layersPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await layersPanel.locator("#studioLayersPresetSelect").selectOption("political");
    await page.locator("[data-studio-action='layer'][data-value='toggleRivers']").click();
    await page.locator("[data-studio-action='layer'][data-value='toggleStates']").click();
    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      rivers: (window as any).layerIsOn?.("toggleRivers"),
      states: (window as any).layerIsOn?.("toggleStates"),
    }))).toMatchObject({preset: "custom", rivers: false, states: false});

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const projectDocumentPanel = projectDocumentPanelLocator(page);
    const nameInput = projectDocumentPanel.locator("#studioProjectNameInput");
    const gameProfileSelect = projectDocumentPanel.locator("#studioProjectGameProfileSelect");
    const designIntentInput = projectDocumentPanel.locator("#studioProjectDesignIntentInput");
    const designIntent = "Round trip this 4X draft with coastal starts and contested iron passes";

    await nameInput.fill("Round Trip AGM Draft");
    await nameInput.blur();
    await gameProfileSelect.selectOption("4x");
    await designIntentInput.fill(designIntent);
    await designIntentInput.blur();
    await expect(page.locator("#studioProjectWorldJsonDraft")).toContainText(designIntent);

    await openExportWorkspace(page);
    const downloadPromise = page.waitForEvent("download");
    await page.locator(".studio-sidebar--right").getByRole("button", {name: "Export AGM file"}).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const exportedDraft = JSON.parse(await fs.readFile(downloadPath!, "utf8"));
    expect(exportedDraft.world.layers).toMatchObject({
      preset: "custom",
      visible: {
        toggleRivers: false,
        toggleStates: false,
      },
    });
    expect(exportedDraft.world.layers.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: "toggleRivers", label: expect.any(String), shortcut: expect.any(String), pinned: expect.any(Boolean), active: false}),
        expect.objectContaining({id: "toggleStates", label: expect.any(String), shortcut: expect.any(String), pinned: expect.any(Boolean), active: false}),
      ]),
    );
    expect(exportedDraft.world.layers.details.length).toBeGreaterThan(20);
    expect(exportedDraft.world.entities).toMatchObject({
      states: expect.any(Array),
      burgs: expect.any(Array),
      cultures: expect.any(Array),
      religions: expect.any(Array),
    });
    expect(exportedDraft.world.entities.states.length).toBeGreaterThan(0);
    expect(exportedDraft.world.entities.burgs.length).toBeGreaterThan(0);
    expect(exportedDraft.world.entities.cultures.length).toBeGreaterThan(0);
    expect(exportedDraft.world.entities.religions.length).toBeGreaterThan(0);
    expect(exportedDraft.world.entities.states[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedDraft.world.entities.burgs[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedDraft.world.entities.cultures[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedDraft.world.entities.religions[0]).toEqual(expect.objectContaining({id: expect.any(Number), name: expect.any(String)}));
    expect(exportedDraft.world.playability).toMatchObject({
      spawnCandidates: expect.any(Array),
      balanceHints: expect.any(Array),
    });
    expect(exportedDraft.world.playability.spawnCandidates.length).toBeGreaterThan(0);
    expect(exportedDraft.world.playability.autoFixDrafts.length).toBeGreaterThan(0);
    expect(exportedDraft.world.playability.balanceHints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: "spawn-candidate-coverage", category: "spawn"}),
        expect.objectContaining({id: "settlement-distribution", category: "settlement"}),
        expect.objectContaining({id: "route-connectivity", category: "connectivity"}),
        expect.objectContaining({id: "biome-habitability", category: "habitability"}),
      ]),
    );
    expect(exportedDraft.world.playability.autoFixDrafts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: "auto-fix-spawn-candidate-coverage", hintId: "spawn-candidate-coverage", action: "expand-spawn-candidate-set"}),
        expect.objectContaining({id: "auto-fix-settlement-distribution", hintId: "settlement-distribution", action: "rebalance-settlement-density"}),
        expect.objectContaining({id: "auto-fix-route-connectivity", hintId: "route-connectivity", action: "draft-route-connectors"}),
        expect.objectContaining({id: "auto-fix-biome-habitability", hintId: "biome-habitability", action: "tune-habitable-biome-weights"}),
      ]),
    );
    expect(exportedDraft.world.playability.autoFixDrafts[0].steps.length).toBeGreaterThan(0);
    expect(exportedDraft.world.playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-settlement-distribution").previewDiff.mode).toBe("dry-run");
    expect(exportedDraft.world.playability.autoFixDrafts.find((draft: any) => draft.id === "auto-fix-route-connectivity").previewDiff.mode).toBe("dry-run");
    expect(exportedDraft.world.package).toMatchObject({
      schema: "agm.package.v0",
      manifest: {
        id: "Round-Trip-AGM-Draft",
        name: "Round Trip AGM Draft",
        profile: "4x",
        profileLabel: "4X civilization map",
        sourceSchema: "agm.world.v0",
      },
      map: {
        seed: expect.any(String),
        width: expect.any(Number),
        height: expect.any(Number),
        style: expect.any(String),
        heightmap: expect.any(String),
      },
      indexes: {
        states: expect.any(Array),
        burgs: expect.any(Array),
        cultures: expect.any(Array),
        religions: expect.any(Array),
      },
      playability: {
        spawnCandidates: expect.any(Array),
        balanceHints: expect.any(Array),
        autoFixDrafts: expect.any(Array),
        appliedPreviewChanges: expect.any(Array),
      },
      exportTargets: expect.arrayContaining(["json", "unity", "godot", "unreal", "tiled", "geojson", "heightmap"]),
    });
    expect(exportedDraft.world.package.indexes.states).toContain(exportedDraft.world.entities.states[0].id);
    expect(exportedDraft.world.package.indexes.burgs).toContain(exportedDraft.world.entities.burgs[0].id);
    expect(exportedDraft.world.package.indexes.cultures).toContain(exportedDraft.world.entities.cultures[0].id);
    expect(exportedDraft.world.package.indexes.religions).toContain(exportedDraft.world.entities.religions[0].id);

    await canvasNav.click();
    await canvasPanel.locator("#studioInspectorPresetSelect").selectOption("desktop-landscape");
    await canvasPanel.locator("[data-studio-action='orientation'][data-value='landscape']").click();
    await page.locator("[data-studio-action='fitmode'][data-value='contain']").first().click();

    await exportNav.click();
    await page.locator("[data-studio-action='export-format'][data-value='png']").click();

    await layersNav.click();
    await layersPanel.locator("#studioLayersPresetSelect").selectOption("religions");
    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      rivers: (window as any).layerIsOn?.("toggleRivers"),
      states: (window as any).layerIsOn?.("toggleStates"),
    }))).not.toMatchObject({rivers: false, states: false});

    await projectNav.click();
    await nameInput.fill("Temporary Import Drift");
    await nameInput.blur();
    await gameProfileSelect.selectOption("rpg");
    await designIntentInput.fill("This drift should be replaced by the imported file");
    await designIntentInput.blur();

    await openExportWorkspace(page);
    await page.locator("#studioAgmFileInput").setInputFiles(downloadPath!);
    await projectNav.click();

    await expect(nameInput).toHaveValue("Round Trip AGM Draft");
    await expect(gameProfileSelect).toHaveValue("4x");
    await expect(designIntentInput).toHaveValue(designIntent);
    await expect(projectDocumentPanel).toContainText("4X civilization map");
    await expect(projectDocumentPanel).toContainText("Document sourceAGM Studio");
    await expect.poll(() => page.evaluate(() => (window as any).mapName?.value || "")).toBe("Round Trip AGM Draft");

    await canvasNav.click();
    await expect(canvasPanel.locator("#studioInspectorPresetSelect")).toHaveValue("mobile-portrait");
    await expect(canvasPanel.locator("[data-studio-action='orientation'][data-value='portrait']")).toHaveClass(/is-selected/);
    await expect(page.locator("[data-studio-action='fitmode'][data-value='cover']").first()).toHaveClass(/is-selected/);

    await exportNav.click();
    await expect(page.locator("[data-studio-action='export-format'][data-value='jpeg']")).toHaveClass(/is-selected/);
    await expect(page.locator("[data-studio-action='run-export']")).toContainText("Export current image JPEG");

    await layersNav.click();
    await expect(layersPanel.locator("#studioLayersPresetSelect")).toHaveValue("custom");
    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      rivers: (window as any).layerIsOn?.("toggleRivers"),
      states: (window as any).layerIsOn?.("toggleStates"),
    }))).toMatchObject({preset: "custom", rivers: false, states: false});
  });

  test("routes Project seed history through the Studio shell", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);

    await page.evaluate(() => {
      const w = window as any;
      w.__studioProjectSeedHistoryCalls = [];
      const trigger = document.getElementById("optionsMapHistory") as HTMLElement | null;
      const originalClick = trigger?.click?.bind(trigger);
      if (trigger) {
        trigger.click = () => {
          w.__studioProjectSeedHistoryCalls.push("seed-history");
        };
      }
      w.__studioProjectSeedHistoryRestore = () => {
        if (trigger && originalClick) trigger.click = originalClick;
      };
    });

    await workspacePanel.getByRole("button", {name: "Seed history"}).click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectSeedHistoryCalls)).toEqual(["seed-history"]);

    await page.evaluate(() => {
      (window as any).__studioProjectSeedHistoryRestore?.();
      delete (window as any).__studioProjectSeedHistoryCalls;
      delete (window as any).__studioProjectSeedHistoryRestore;
    });
  });

  test("routes Project copy seed URL through the Studio shell", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);

    await page.evaluate(() => {
      const w = window as any;
      w.__studioProjectCopySeedCalls = [];
      const trigger = document.getElementById("optionsCopySeed") as HTMLElement | null;
      const originalClick = trigger?.click?.bind(trigger);
      if (trigger) {
        trigger.click = () => {
          w.__studioProjectCopySeedCalls.push("copy-seed-url");
        };
      }
      w.__studioProjectCopySeedRestore = () => {
        if (trigger && originalClick) trigger.click = originalClick;
      };
    });

    await workspacePanel.getByRole("button", {name: "Copy seed URL"}).click();

    await expect.poll(() => page.evaluate(() => (window as any).__studioProjectCopySeedCalls)).toEqual(["copy-seed-url"]);

    await page.evaluate(() => {
      (window as any).__studioProjectCopySeedRestore?.();
      delete (window as any).__studioProjectCopySeedCalls;
      delete (window as any).__studioProjectCopySeedRestore;
    });
  });

  test("keeps Project workspace template aligned after seed history restores legacy values", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const templateSelect = workspacePanel.locator("#studioProjectTemplateSelect");
    const restored = await page.evaluate(() => {
      const select = document.getElementById("templateInput") as HTMLSelectElement | null;
      const option = Array.from(select?.options || []).find(option => option.value);
      const value = option?.value || "continents";
      const label = option?.textContent?.trim() || value;
      if (select) {
        if (!Array.from(select.options).some(option => option.value === value)) {
          select.options.add(new Option(label, value));
        }
        select.value = value;
      }
      const seed = document.getElementById("optionsSeed") as HTMLInputElement | null;
      const width = document.getElementById("mapWidthInput") as HTMLInputElement | null;
      const height = document.getElementById("mapHeightInput") as HTMLInputElement | null;
      if (seed) seed.value = "history-seed";
      if (width) width.value = "1777";
      if (height) height.value = "999";
      return {value, label};
    });

    await page.evaluate(({value}) => {
      const w = window as any;
      w.__studioProjectSeedHistoryTemplateRestore = w.restoreSeed;
      w.restoreSeed = () => {
        const seed = document.getElementById("optionsSeed") as HTMLInputElement | null;
        const width = document.getElementById("mapWidthInput") as HTMLInputElement | null;
        const height = document.getElementById("mapHeightInput") as HTMLInputElement | null;
        const select = document.getElementById("templateInput") as HTMLSelectElement | null;
        if (seed) {
          seed.value = "history-seed";
          seed.dispatchEvent(new Event("input", {bubbles: true}));
          seed.dispatchEvent(new Event("change", {bubbles: true}));
        }
        if (width) {
          width.value = "1777";
          width.dispatchEvent(new Event("input", {bubbles: true}));
          width.dispatchEvent(new Event("change", {bubbles: true}));
        }
        if (height) {
          height.value = "999";
          height.dispatchEvent(new Event("input", {bubbles: true}));
          height.dispatchEvent(new Event("change", {bubbles: true}));
        }
        if (select) {
          select.value = value;
          select.dispatchEvent(new Event("input", {bubbles: true}));
          select.dispatchEvent(new Event("change", {bubbles: true}));
        }
      };
      w.__studioProjectSeedHistoryDialogRestore = w.$;
      const original$ = w.$;
      if (typeof original$ === "function") {
        w.$ = (...args: any[]) => {
          const result = original$(...args);
          if (args[0] === "#alert" && result && typeof result.dialog === "function") {
            const originalDialog = result.dialog.bind(result);
            result.dialog = (config?: any) => {
              if (config?.buttons && typeof config.buttons === "object") {
                const firstButton = Object.values(config.buttons)[0] as (() => void) | undefined;
                firstButton?.();
                return result;
              }
              return originalDialog(config);
            };
          }
          return result;
        };
      }
    }, restored);

    await workspacePanel.getByRole("button", {name: "Seed history"}).click();
    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(templateSelect).toHaveValue(restored.value);
    await expect(workspacePanel).toContainText(restored.label);

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioProjectSeedHistoryTemplateRestore) w.restoreSeed = w.__studioProjectSeedHistoryTemplateRestore;
      if (w.__studioProjectSeedHistoryDialogRestore) w.$ = w.__studioProjectSeedHistoryDialogRestore;
      delete w.__studioProjectSeedHistoryTemplateRestore;
      delete w.__studioProjectSeedHistoryDialogRestore;
    });
  });

  test("writes back Project workspace seed input into legacy pending seed", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const seedInput = workspacePanel.locator("#studioProjectSeedInput");

    await seedInput.fill("424242");
    await seedInput.blur();

    await expect.poll(() => page.evaluate(() => (document.getElementById("optionsSeed") as HTMLInputElement | null)?.value)).toBe("424242");
    await expect(workspacePanel).toContainText("424242");
  });

  test("writes back Project workspace points density into legacy pending points", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const pointsInput = workspacePanel.locator("#studioProjectPointsInput");

    await pointsInput.evaluate((element: HTMLInputElement) => {
      element.value = "6";
      element.dispatchEvent(new Event("input", {bubbles: true}));
      element.dispatchEvent(new Event("change", {bubbles: true}));
    });

    await expect.poll(() => page.evaluate(() => ({
      points: (document.getElementById("pointsInput") as HTMLInputElement | null)?.value,
      label:
        (document.getElementById("pointsOutputFormatted") as HTMLOutputElement | null)?.value ||
        (document.getElementById("pointsOutputFormatted") as HTMLOutputElement | null)?.textContent?.trim() || "",
    }))).toEqual({points: "6", label: "30K"});
    await expect(workspacePanel).toContainText("30K");
  });

  test("writes back Project workspace states and provinces ratio into legacy pending values", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const statesInput = workspacePanel.locator("#studioProjectStatesInput");
    const provincesRatioInput = workspacePanel.locator("#studioProjectProvincesRatioInput");

    await statesInput.fill("24");
    await statesInput.blur();
    await provincesRatioInput.fill("42");
    await provincesRatioInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      states: (document.getElementById("statesNumber") as HTMLInputElement | null)?.value,
      provincesRatio: (document.getElementById("provincesRatio") as HTMLInputElement | null)?.value,
    }))).toEqual({states: "24", provincesRatio: "42"});
    await expect(workspacePanel).toContainText("24");
    await expect(workspacePanel).toContainText("42");
  });

  test("writes back Project workspace growth rate and size variety into legacy pending values", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const growthRateInput = workspacePanel.locator("#studioProjectGrowthRateInput");
    const sizeVarietyInput = workspacePanel.locator("#studioProjectSizeVarietyInput");

    await growthRateInput.fill("1.7");
    await growthRateInput.blur();
    await sizeVarietyInput.fill("5.2");
    await sizeVarietyInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      growthRate: (document.getElementById("growthRate") as HTMLInputElement | null)?.value,
      sizeVariety: (document.getElementById("sizeVariety") as HTMLInputElement | null)?.value,
    }))).toEqual({growthRate: "1.7", sizeVariety: "5.2"});
    await expect(workspacePanel).toContainText("1.7");
    await expect(workspacePanel).toContainText("5.2");
  });

  test("writes back Project workspace equator temperature into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureEquatorInput");

    await temperatureInput.fill("26");
    await temperatureInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("temperatureEquatorInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("temperatureEquatorOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "26", output: "26"});
    await expect(workspacePanel).toContainText("26°C");
  });

  test("keeps Project workspace equator temperature aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureEquatorInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("temperatureEquatorInput") as HTMLInputElement | null;
      const output = document.getElementById("temperatureEquatorOutput") as HTMLInputElement | null;
      if (!input || !output) return "18";
      input.value = "18";
      output.value = "18";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(temperatureInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°C`);
  });

  test("writes back Project workspace North Pole temperature into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureNorthPoleInput");

    await temperatureInput.fill("-24");
    await temperatureInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("temperatureNorthPoleInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("temperatureNorthPoleOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "-24", output: "-24"});
    await expect(workspacePanel).toContainText("-24°C");
  });

  test("keeps Project workspace North Pole temperature aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureNorthPoleInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("temperatureNorthPoleInput") as HTMLInputElement | null;
      const output = document.getElementById("temperatureNorthPoleOutput") as HTMLInputElement | null;
      if (!input || !output) return "-17";
      input.value = "-17";
      output.value = "-17";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(temperatureInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°C`);
  });

  test("writes back Project workspace South Pole temperature into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureSouthPoleInput");

    await temperatureInput.fill("-32");
    await temperatureInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("temperatureSouthPoleInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("temperatureSouthPoleOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "-32", output: "-32"});
    await expect(workspacePanel).toContainText("-32°C");
  });

  test("keeps Project workspace South Pole temperature aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const temperatureInput = workspacePanel.locator("#studioProjectTemperatureSouthPoleInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("temperatureSouthPoleInput") as HTMLInputElement | null;
      const output = document.getElementById("temperatureSouthPoleOutput") as HTMLInputElement | null;
      if (!input || !output) return "-21";
      input.value = "-21";
      output.value = "-21";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(temperatureInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°C`);
  });

  test("writes back Project workspace map size into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const mapSizeInput = workspacePanel.locator("#studioProjectMapSizeInput");

    await mapSizeInput.fill("62.5");
    await mapSizeInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("mapSizeInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("mapSizeOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "62.5", output: "62.5"});
    await expect(workspacePanel).toContainText("62.5%");
  });

  test("keeps Project workspace map size aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const mapSizeInput = workspacePanel.locator("#studioProjectMapSizeInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("mapSizeInput") as HTMLInputElement | null;
      const output = document.getElementById("mapSizeOutput") as HTMLInputElement | null;
      if (!input || !output) return "47.5";
      input.value = "47.5";
      output.value = "47.5";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(mapSizeInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}%`);
  });

  test("writes back Project workspace latitude into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const latitudeInput = workspacePanel.locator("#studioProjectLatitudeInput");

    await latitudeInput.fill("37.5");
    await latitudeInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("latitudeInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("latitudeOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "37.5", output: "37.5"});
    await expect(workspacePanel).toContainText("37.5%");
  });

  test("keeps Project workspace latitude aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const latitudeInput = workspacePanel.locator("#studioProjectLatitudeInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("latitudeInput") as HTMLInputElement | null;
      const output = document.getElementById("latitudeOutput") as HTMLInputElement | null;
      if (!input || !output) return "42.5";
      input.value = "42.5";
      output.value = "42.5";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(latitudeInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}%`);
  });

  test("writes back Project workspace longitude into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const longitudeInput = workspacePanel.locator("#studioProjectLongitudeInput");

    await longitudeInput.fill("63.5");
    await longitudeInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("longitudeInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("longitudeOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "63.5", output: "63.5"});
    await expect(workspacePanel).toContainText("63.5%");
  });

  test("keeps Project workspace longitude aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const longitudeInput = workspacePanel.locator("#studioProjectLongitudeInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("longitudeInput") as HTMLInputElement | null;
      const output = document.getElementById("longitudeOutput") as HTMLInputElement | null;
      if (!input || !output) return "58.5";
      input.value = "58.5";
      output.value = "58.5";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(longitudeInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}%`);
  });

  test("writes back Project workspace wind tier 0 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier0Input = workspacePanel.locator("#studioProjectWindTier0Input");

    await windTier0Input.fill("270");
    await windTier0Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='0']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(270 210 6)");
    await expect(windTier0Input).toHaveValue("270");
    await expect(workspacePanel).toContainText("270°");
  });

  test("keeps Project workspace wind tier 0 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier0Input = workspacePanel.locator("#studioProjectWindTier0Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='0']") as SVGPathElement | null;
      if (!arrow) return "315";
      arrow.setAttribute("transform", "rotate(315 210 6)");
      return "315";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier0Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace wind tier 1 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier1Input = workspacePanel.locator("#studioProjectWindTier1Input");

    await windTier1Input.fill("90");
    await windTier1Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='1']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(90 210 30)");
    await expect(windTier1Input).toHaveValue("90");
    await expect(workspacePanel).toContainText("90°");
  });

  test("keeps Project workspace wind tier 1 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier1Input = workspacePanel.locator("#studioProjectWindTier1Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='1']") as SVGPathElement | null;
      if (!arrow) return "135";
      arrow.setAttribute("transform", "rotate(135 210 30)");
      return "135";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier1Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace wind tier 2 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier2Input = workspacePanel.locator("#studioProjectWindTier2Input");

    await windTier2Input.fill("270");
    await windTier2Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='2']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(270 210 75)");
    await expect(windTier2Input).toHaveValue("270");
    await expect(workspacePanel).toContainText("270°");
  });

  test("keeps Project workspace wind tier 2 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier2Input = workspacePanel.locator("#studioProjectWindTier2Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='2']") as SVGPathElement | null;
      if (!arrow) return "315";
      arrow.setAttribute("transform", "rotate(315 210 75)");
      return "315";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier2Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace wind tier 3 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier3Input = workspacePanel.locator("#studioProjectWindTier3Input");

    await windTier3Input.fill("0");
    await windTier3Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='3']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(0 210 130)");
    await expect(windTier3Input).toHaveValue("0");
    await expect(workspacePanel).toContainText("0°");
  });

  test("keeps Project workspace wind tier 3 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier3Input = workspacePanel.locator("#studioProjectWindTier3Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='3']") as SVGPathElement | null;
      if (!arrow) return "45";
      arrow.setAttribute("transform", "rotate(45 210 130)");
      return "45";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier3Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace wind tier 4 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier4Input = workspacePanel.locator("#studioProjectWindTier4Input");

    await windTier4Input.fill("180");
    await windTier4Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='4']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(180 210 173)");
    await expect(windTier4Input).toHaveValue("180");
    await expect(workspacePanel).toContainText("180°");
  });

  test("keeps Project workspace wind tier 4 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier4Input = workspacePanel.locator("#studioProjectWindTier4Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='4']") as SVGPathElement | null;
      if (!arrow) return "225";
      arrow.setAttribute("transform", "rotate(225 210 173)");
      return "225";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier4Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace wind tier 5 into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier5Input = workspacePanel.locator("#studioProjectWindTier5Input");

    await windTier5Input.fill("270");
    await windTier5Input.blur();

    await expect.poll(() =>
      page.evaluate(() => {
        const arrow = document.querySelector("#globeWindArrows path[data-tier='5']") as SVGPathElement | null;
        return arrow?.getAttribute("transform") || "";
      }),
    ).toBe("rotate(270 210 194)");
    await expect(windTier5Input).toHaveValue("270");
    await expect(workspacePanel).toContainText("270°");
  });

  test("keeps Project workspace wind tier 5 aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const windTier5Input = workspacePanel.locator("#studioProjectWindTier5Input");

    const nextValue = await page.evaluate(() => {
      const arrow = document.querySelector("#globeWindArrows path[data-tier='5']") as SVGPathElement | null;
      if (!arrow) return "0";
      arrow.setAttribute("transform", "rotate(0 210 194)");
      return "0";
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(windTier5Input).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}°`);
  });

  test("writes back Project workspace precipitation into legacy world settings", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const precipitationInput = workspacePanel.locator("#studioProjectPrecipitationInput");

    await precipitationInput.fill("135");
    await precipitationInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      input: (document.getElementById("precInput") as HTMLInputElement | null)?.value || "",
      output: (document.getElementById("precOutput") as HTMLInputElement | null)?.value || "",
    }))).toEqual({input: "135", output: "135"});
    await expect(workspacePanel).toContainText("135%");
  });

  test("keeps Project workspace precipitation aligned after legacy world changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const precipitationInput = workspacePanel.locator("#studioProjectPrecipitationInput");

    const nextValue = await page.evaluate(() => {
      const input = document.getElementById("precInput") as HTMLInputElement | null;
      const output = document.getElementById("precOutput") as HTMLInputElement | null;
      if (!input || !output) return "120";
      input.value = "145";
      output.value = "145";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      output.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
      output.dispatchEvent(new Event("change", {bubbles: true}));
      return input.value;
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(precipitationInput).toHaveValue(nextValue);
    await expect(workspacePanel).toContainText(`${nextValue}%`);
  });

  test("writes back Project workspace cultures, burgs, religions, and culture set into legacy pending values", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const culturesInput = workspacePanel.locator("#studioProjectCulturesInput");
    const burgsInput = workspacePanel.locator("#studioProjectBurgsInput");
    const religionsInput = workspacePanel.locator("#studioProjectReligionsInput");
    const cultureSetSelect = workspacePanel.locator("#studioProjectCultureSetSelect");
    const nextCultureSet = await page.evaluate(() => {
      const select = document.getElementById("culturesSet") as HTMLSelectElement | null;
      return Array.from(select?.options || []).map(option => option.value).find(value => value && value !== select?.value) || select?.value || "world";
    });

    await culturesInput.fill("18");
    await culturesInput.blur();
    await burgsInput.fill("1000");
    await burgsInput.blur();
    await religionsInput.fill("12");
    await religionsInput.blur();
    await cultureSetSelect.selectOption(nextCultureSet);

    const expected = await page.evaluate(value => {
      const select = document.getElementById("culturesSet") as HTMLSelectElement | null;
      const option = Array.from(select?.options || []).find(option => option.value === value);
      const burgsOutput = document.getElementById("manorsOutput") as HTMLOutputElement | null;
      return {
        cultures: (document.getElementById("culturesInput") as HTMLInputElement | null)?.value || "",
        burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value || "",
        burgsLabel: burgsOutput?.value || burgsOutput?.textContent?.trim() || "",
        religions: (document.getElementById("religionsNumber") as HTMLInputElement | null)?.value || "",
        cultureSet: select?.value || "",
        cultureLabel: option?.textContent?.trim() || value,
      };
    }, nextCultureSet);

    await expect.poll(() => page.evaluate(() => {
      const select = document.getElementById("culturesSet") as HTMLSelectElement | null;
      const option = select?.selectedOptions?.[0] ?? null;
      const burgsOutput = document.getElementById("manorsOutput") as HTMLOutputElement | null;
      return {
        cultures: (document.getElementById("culturesInput") as HTMLInputElement | null)?.value || "",
        burgs: (document.getElementById("manorsInput") as HTMLInputElement | null)?.value || "",
        burgsLabel: burgsOutput?.value || burgsOutput?.textContent?.trim() || "",
        religions: (document.getElementById("religionsNumber") as HTMLInputElement | null)?.value || "",
        cultureSet: select?.value || "",
        cultureLabel: option?.textContent?.trim() || select?.value || "",
      };
    })).toEqual(expected);
    await expect(workspacePanel).toContainText(expected.cultures);
    await expect(workspacePanel).toContainText(expected.burgsLabel);
    await expect(workspacePanel).toContainText(expected.religions);
    await expect(workspacePanel).toContainText(expected.cultureLabel);
  });

  test("keeps Project workspace points density aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const pointsInput = workspacePanel.locator("#studioProjectPointsInput");

    await page.evaluate(() => {
      const input = document.getElementById("pointsInput") as HTMLInputElement | null;
      if (!input) return;
      input.value = "8";
      input.dispatchEvent(new Event("input", {bubbles: true}));
      input.dispatchEvent(new Event("change", {bubbles: true}));
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(pointsInput).toHaveValue("8");
    await expect(workspacePanel).toContainText("50K");
  });

  test("keeps Project workspace states and provinces ratio aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const statesInput = workspacePanel.locator("#studioProjectStatesInput");
    const provincesRatioInput = workspacePanel.locator("#studioProjectProvincesRatioInput");

    await page.evaluate(() => {
      const states = document.getElementById("statesNumber") as HTMLInputElement | null;
      const provincesRatio = document.getElementById("provincesRatio") as HTMLInputElement | null;
      if (states) {
        states.value = "11";
        states.dispatchEvent(new Event("input", {bubbles: true}));
        states.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (provincesRatio) {
        provincesRatio.value = "57";
        provincesRatio.dispatchEvent(new Event("input", {bubbles: true}));
        provincesRatio.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(statesInput).toHaveValue("11");
    await expect(provincesRatioInput).toHaveValue("57");
    await expect(workspacePanel).toContainText("11");
    await expect(workspacePanel).toContainText("57");
  });

  test("keeps Project workspace growth rate and size variety aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const growthRateInput = workspacePanel.locator("#studioProjectGrowthRateInput");
    const sizeVarietyInput = workspacePanel.locator("#studioProjectSizeVarietyInput");

    await page.evaluate(() => {
      const growthRate = document.getElementById("growthRate") as HTMLInputElement | null;
      const sizeVariety = document.getElementById("sizeVariety") as HTMLInputElement | null;
      if (growthRate) {
        growthRate.value = "1.3";
        growthRate.dispatchEvent(new Event("input", {bubbles: true}));
        growthRate.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (sizeVariety) {
        sizeVariety.value = "7.8";
        sizeVariety.dispatchEvent(new Event("input", {bubbles: true}));
        sizeVariety.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(growthRateInput).toHaveValue("1.3");
    await expect(sizeVarietyInput).toHaveValue("7.8");
    await expect(workspacePanel).toContainText("1.3");
    await expect(workspacePanel).toContainText("7.8");
  });

  test("writes back Project workspace state labels mode into legacy pending value", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const stateLabelsModeSelect = workspacePanel.locator("#studioProjectStateLabelsModeSelect");
    const nextValue = await page.evaluate(() => {
      const select = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
      return Array.from(select?.options || []).map(option => option.value).find(value => value && value !== select?.value) || select?.value || "auto";
    });

    await stateLabelsModeSelect.selectOption(nextValue);

    const expected = await page.evaluate(value => {
      const select = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
      const option = Array.from(select?.options || []).find(option => option.value === value);
      return {
        value: select?.value || "",
        label: option?.textContent?.trim() || value,
      };
    }, nextValue);

    await expect.poll(() => page.evaluate(() => {
      const select = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
      const option = select?.selectedOptions?.[0] ?? null;
      return {
        value: select?.value || "",
        label: option?.textContent?.trim() || select?.value || "",
      };
    })).toEqual(expected);
    await expect(workspacePanel).toContainText(expected.label);
  });

  test("keeps Project workspace state labels mode aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const stateLabelsModeSelect = workspacePanel.locator("#studioProjectStateLabelsModeSelect");

    const nextState = await page.evaluate(() => {
      const select = document.getElementById("stateLabelsModeInput") as HTMLSelectElement | null;
      if (!select) return {value: "auto", label: "Auto"};
      const options = Array.from(select.options);
      const nextOption = options.find(option => option.value && option.value !== select.value) || options[0];
      if (nextOption) {
        select.value = nextOption.value;
        select.dispatchEvent(new Event("input", {bubbles: true}));
        select.dispatchEvent(new Event("change", {bubbles: true}));
      }
      return {
        value: select.value,
        label: select.selectedOptions?.[0]?.textContent?.trim() || select.value,
      };
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(stateLabelsModeSelect).toHaveValue(nextState.value);
    await expect(workspacePanel).toContainText(nextState.label);
  });

  test("keeps Project workspace cultures, burgs, religions, and culture set aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const culturesInput = workspacePanel.locator("#studioProjectCulturesInput");
    const burgsInput = workspacePanel.locator("#studioProjectBurgsInput");
    const religionsInput = workspacePanel.locator("#studioProjectReligionsInput");
    const cultureSetSelect = workspacePanel.locator("#studioProjectCultureSetSelect");

    const nextState = await page.evaluate(() => {
      const culturesInput = document.getElementById("culturesInput") as HTMLInputElement | null;
      const burgsInput = document.getElementById("manorsInput") as HTMLInputElement | null;
      const burgsOutput = document.getElementById("manorsOutput") as HTMLOutputElement | null;
      const religionsInput = document.getElementById("religionsNumber") as HTMLInputElement | null;
      const cultureSet = document.getElementById("culturesSet") as HTMLSelectElement | null;
      if (!cultureSet) return {cultures: "9", burgs: "1000", burgsLabel: "auto", religions: "6", value: "", label: ""};
      const options = Array.from(cultureSet.options);
      const nextOption = options.find(option => option.value && option.value !== cultureSet.value) || options[0];
      if (culturesInput) {
        culturesInput.value = "9";
        culturesInput.dispatchEvent(new Event("input", {bubbles: true}));
        culturesInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (burgsInput) {
        burgsInput.value = "1000";
        burgsInput.dispatchEvent(new Event("input", {bubbles: true}));
        burgsInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (religionsInput) {
        religionsInput.value = "12";
        religionsInput.dispatchEvent(new Event("input", {bubbles: true}));
        religionsInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (nextOption) {
        cultureSet.value = nextOption.value;
        cultureSet.dispatchEvent(new Event("input", {bubbles: true}));
        cultureSet.dispatchEvent(new Event("change", {bubbles: true}));
      }
      return {
        cultures: culturesInput?.value || "",
        burgs: burgsInput?.value || "",
        burgsLabel: burgsOutput?.value || burgsOutput?.textContent?.trim() || "",
        religions: religionsInput?.value || "",
        value: cultureSet.value,
        label: cultureSet.selectedOptions?.[0]?.textContent?.trim() || cultureSet.value,
      };
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(culturesInput).toHaveValue(nextState.cultures);
    await expect(burgsInput).toHaveValue(nextState.burgs);
    await expect(religionsInput).toHaveValue(nextState.religions);
    await expect(cultureSetSelect).toHaveValue(nextState.value);
    await expect(workspacePanel).toContainText(nextState.burgsLabel);
    await expect(workspacePanel).toContainText(nextState.label);
  });

  test("writes back Project workspace heightmap into legacy pending template", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const templateSelect = workspacePanel.locator("#studioProjectTemplateSelect");
    const templateValue = await page.evaluate(() => {
      const select = document.getElementById("templateInput") as HTMLSelectElement | null;
      return Array.from(select?.options || []).map(option => option.value).find(value => value && value !== select?.value) || "continents";
    });

    await templateSelect.selectOption(templateValue);

    await expect.poll(() => page.evaluate(() => ({
      value: (document.getElementById("templateInput") as HTMLSelectElement | null)?.value,
      label:
        (document.getElementById("templateInput") as HTMLSelectElement | null)?.selectedOptions?.[0]?.textContent?.trim() || "",
    }))).toEqual(await page.evaluate(value => {
      const select = document.getElementById("templateInput") as HTMLSelectElement | null;
      const option = Array.from(select?.options || []).find(option => option.value === value);
      return {value, label: option?.textContent?.trim() || value};
    }, templateValue));
    await expect(workspacePanel).toContainText(
      await page.evaluate(value => {
        const select = document.getElementById("templateInput") as HTMLSelectElement | null;
        const option = Array.from(select?.options || []).find(option => option.value === value);
        return option?.textContent?.trim() || value;
      }, templateValue),
    );
  });

  test("writes back Project workspace pending canvas size into legacy pending size", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const widthInput = workspacePanel.locator("#studioProjectWidthInput");
    const heightInput = workspacePanel.locator("#studioProjectHeightInput");

    await widthInput.fill("2468");
    await widthInput.blur();
    await heightInput.fill("1357");
    await heightInput.blur();

    await expect.poll(() => page.evaluate(() => ({
      width: (document.getElementById("mapWidthInput") as HTMLInputElement | null)?.value,
      height: (document.getElementById("mapHeightInput") as HTMLInputElement | null)?.value,
    }))).toEqual({width: "2468", height: "1357"});
    await expect(workspacePanel).toContainText("2468 × 1357");
  });

  test("restores Project workspace pending canvas size through the Studio shell", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await page.evaluate(() => {
      localStorage.setItem("mapWidth", "3333");
      localStorage.setItem("mapHeight", "2222");
      const width = document.getElementById("mapWidthInput") as HTMLInputElement | null;
      const height = document.getElementById("mapHeightInput") as HTMLInputElement | null;
      if (width) {
        width.value = "3333";
        width.dispatchEvent(new Event("input", {bubbles: true}));
        width.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (height) {
        height.value = "2222";
        height.dispatchEvent(new Event("input", {bubbles: true}));
        height.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    await workspacePanel.getByRole("button", {name: "Restore default canvas size"}).click();

    const viewportSize = await page.evaluate(() => ({
      width: String(window.innerWidth),
      height: String(window.innerHeight),
    }));

    await expect.poll(() => page.evaluate(() => ({
      width: (document.getElementById("mapWidthInput") as HTMLInputElement | null)?.value,
      height: (document.getElementById("mapHeightInput") as HTMLInputElement | null)?.value,
      storedWidth: localStorage.getItem("mapWidth"),
      storedHeight: localStorage.getItem("mapHeight"),
    }))).toEqual({
      width: viewportSize.width,
      height: viewportSize.height,
      storedWidth: null,
      storedHeight: null,
    });
    await expect(workspacePanel).toContainText(`${viewportSize.width} × ${viewportSize.height}`);
  });

  test("keeps Project workspace seed input aligned after legacy pending seed changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const seedInput = workspacePanel.locator("#studioProjectSeedInput");

    await page.evaluate(() => {
      const seed = document.getElementById("optionsSeed") as HTMLInputElement | null;
      if (!seed) return;
      seed.value = "987654";
      seed.dispatchEvent(new Event("input", {bubbles: true}));
      seed.dispatchEvent(new Event("change", {bubbles: true}));
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(seedInput).toHaveValue("987654");
    await expect(workspacePanel).toContainText("987654");
  });

  test("keeps Project workspace template aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const templateSelect = workspacePanel.locator("#studioProjectTemplateSelect");
    const nextTemplate = await page.evaluate(() => {
      const select = document.getElementById("templateInput") as HTMLSelectElement | null;
      const options = Array.from(select?.options || []);
      const option = options.find(option => option.value && option.value !== select?.value) || options[0];
      if (!option || !select) return {value: "continents", label: "continents"};
      select.value = option.value;
      select.dispatchEvent(new Event("input", {bubbles: true}));
      select.dispatchEvent(new Event("change", {bubbles: true}));
      return {value: option.value, label: option.textContent?.trim() || option.value};
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(templateSelect).toHaveValue(nextTemplate.value);
    await expect(workspacePanel).toContainText(nextTemplate.label);
  });

  test("keeps Project workspace pending canvas size aligned after legacy changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const widthInput = workspacePanel.locator("#studioProjectWidthInput");
    const heightInput = workspacePanel.locator("#studioProjectHeightInput");

    await page.evaluate(() => {
      const width = document.getElementById("mapWidthInput") as HTMLInputElement | null;
      const height = document.getElementById("mapHeightInput") as HTMLInputElement | null;
      if (width) {
        width.value = "1921";
        width.dispatchEvent(new Event("input", {bubbles: true}));
        width.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (height) {
        height.value = "1081";
        height.dispatchEvent(new Event("input", {bubbles: true}));
        height.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(widthInput).toHaveValue("1921");
    await expect(heightInput).toHaveValue("1081");
    await expect(workspacePanel).toContainText("1921 × 1081");
  });

  test("keeps Project and Layers workspace summaries aligned with legacy workspace state", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");

    await page.evaluate(() => {
      localStorage.setItem("preset", "political");
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "15";
      localStorage.setItem("lastMap", JSON.stringify({id: "workspace-summary"}));
    });

    await layersNav.click();
    const layersSummaryPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect(layersSummaryPanel).toContainText("political");

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("15 min");
    await expect(workspacePanel).toContainText("Available");
    await expect(workspacePanel).toContainText("political");
  });

  test("writes back Project workspace controls into legacy autosave and layers preset", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const autosaveInput = workspacePanel.locator("#studioProjectAutosaveInput");
    const layersPresetSelect = workspacePanel.locator("#studioProjectLayersPresetSelect");

    await autosaveInput.fill("20");
    await autosaveInput.blur();
    await expect.poll(() => page.evaluate(() => (document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null)?.value)).toBe("20");

    await layersPresetSelect.selectOption("cultural");
    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      stored: localStorage.getItem("preset"),
    }))).toEqual({preset: "cultural", stored: "cultural"});
  });

  test("keeps Project workspace controls aligned after legacy autosave and layers preset changes", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);
    const autosaveInput = workspacePanel.locator("#studioProjectAutosaveInput");
    const layersPresetSelect = workspacePanel.locator("#studioProjectLayersPresetSelect");

    await page.evaluate(() => {
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      const autosaveRange = document.getElementById("autosaveIntervalInput") as HTMLInputElement | null;
      const layersPreset = document.getElementById("layersPreset") as HTMLSelectElement | null;
      if (autosaveOutput) {
        autosaveOutput.value = "7";
        autosaveOutput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (autosaveRange) autosaveRange.value = "7";
      if (layersPreset) {
        layersPreset.value = "religions";
        layersPreset.dispatchEvent(new Event("change", {bubbles: true}));
      }
    });

    await page.locator("[data-studio-action='section'][data-value='canvas']").click();
    await projectNav.click();

    await expect(autosaveInput).toHaveValue("7");
    await expect(layersPresetSelect).toHaveValue("religions");
  });

  test("writes back Layers workspace preset control into legacy layers preset", async ({page}) => {
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await layersNav.click();
    await expect(layersNav).toHaveClass(/is-active/);

    const layersPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const layersPresetSelect = layersPanel.locator("#studioLayersPresetSelect");

    await layersPresetSelect.selectOption("religions");
    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      stored: localStorage.getItem("preset"),
    }))).toEqual({preset: "religions", stored: "religions"});
    await expect(layersPanel).toContainText("religions");

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect(workspacePanel).toContainText("religions");
  });

  test("saves a custom layers preset from the Layers workspace", async ({page}) => {
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");

    await page.evaluate(() => {
      const w = window as any;
      const originalPrompt = w.prompt;
      const originalStudioInput = w.requestStudioInput;
      w.__studioLayersPresetPromptRestore = originalPrompt;
      w.__studioLayersPresetInputRestore = originalStudioInput;
      const providePresetName = (_message: string, _options: unknown, callback?: (value: string) => void) => {
        callback?.("studio-custom-preset");
      };
      w.prompt = providePresetName;
      w.requestStudioInput = providePresetName;

      localStorage.removeItem("preset");
      localStorage.removeItem("presets");
      const labels = document.getElementById("toggleLabels");
      labels?.classList.add("buttonoff");
      w.getCurrentPreset?.();
    });

    await layersNav.click();
    await expect(layersNav).toHaveClass(/is-active/);

    const layersPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const saveButton = layersPanel.getByRole("button", {name: "Save preset"});
    const removeButton = layersPanel.getByRole("button", {name: "Remove preset"});

    await expect(saveButton).toBeEnabled();
    await expect(removeButton).toBeDisabled();

    await saveButton.click();

    await expect.poll(() => page.evaluate(() => ({
      preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
      stored: localStorage.getItem("preset"),
      presets: JSON.parse(localStorage.getItem("presets") || "{}"),
    }))).toMatchObject({
      preset: "studio-custom-preset",
      stored: "studio-custom-preset",
      presets: {"studio-custom-preset": expect.any(Array)},
    });
    await expect(layersPanel).toContainText("studio-custom-preset");
    await expect(removeButton).toBeEnabled();

    await page.evaluate(() => {
      const w = window as any;
      w.prompt = w.__studioLayersPresetPromptRestore;
      w.requestStudioInput = w.__studioLayersPresetInputRestore;
      delete w.__studioLayersPresetPromptRestore;
      delete w.__studioLayersPresetInputRestore;
    });
  });

  test("removes a custom layers preset from the Layers workspace", async ({page}) => {
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");

    await page.evaluate(() => {
      const select = document.getElementById("layersPreset") as HTMLSelectElement | null;
      const removeButton = document.getElementById("removePresetButton") as HTMLButtonElement | null;
      const saveButton = document.getElementById("savePresetButton") as HTMLButtonElement | null;
      const storedPresets = {
        "studio-removable-preset": ["toggleBorders", "toggleLabels"],
      };

      localStorage.setItem("presets", JSON.stringify(storedPresets));
      localStorage.setItem("preset", "studio-removable-preset");
      if (select && !Array.from(select.options).some(option => option.value === "studio-removable-preset")) {
        select.add(new Option("studio-removable-preset", "studio-removable-preset", false, false));
      }
      if (select) {
        select.value = "studio-removable-preset";
      }
      if (removeButton) removeButton.style.display = "inline-block";
      if (saveButton) saveButton.style.display = "none";
    });

    await layersNav.click();
    await expect(layersNav).toHaveClass(/is-active/);

    const layersPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const saveButton = layersPanel.getByRole("button", {name: "Save preset"});
    const removeButton = layersPanel.getByRole("button", {name: "Remove preset"});

    await expect(removeButton).toBeEnabled();
    await expect(saveButton).toBeDisabled();

    await removeButton.click();

    await expect.poll(() => page.evaluate(() => {
      const presets = JSON.parse(localStorage.getItem("presets") || "{}");
      return {
        preset: (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value,
        stored: localStorage.getItem("preset"),
        hasRemovedPreset: Object.prototype.hasOwnProperty.call(presets, "studio-removable-preset"),
        saveVisible: (document.getElementById("savePresetButton") as HTMLButtonElement | null)?.style.display,
        removeVisible: (document.getElementById("removePresetButton") as HTMLButtonElement | null)?.style.display,
      };
    })).toEqual({
      preset: "custom",
      stored: null,
      hasRemovedPreset: false,
      saveVisible: "inline-block",
      removeVisible: "none",
    });
    await expect(layersPanel).toContainText("custom");
    await expect(saveButton).toBeEnabled();
  });

  test("keeps Style workspace summary aligned with legacy preset changes", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);

    const stylePanel = page.locator(".studio-sidebar--right .studio-panel").first();

    await page.evaluate(() => {
      const w = window as any;
      localStorage.setItem("presetStyle", "night");
      if (w.stylePreset) w.stylePreset.value = "night";
    });

    await page.locator("[data-studio-action='section'][data-value='project']").click();
    await styleNav.click();

    await expect(stylePanel).toContainText("night");
    await expect(stylePanel).toContainText("system");
  });

  test("falls back Style workspace summary when the stored custom preset is missing or invalid", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);

    const stylePanel = page.locator(".studio-sidebar--right .studio-panel").first();

    await page.evaluate(async () => {
      const w = window as any;
      const originalFetch = w.fetch.bind(w);
      w.__studioStyleFallbackRestore = {fetch: originalFetch};
      w.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/styles/default.json")) {
          return new Response(JSON.stringify({"#map": {"background-color": "#101010"}}), {
            status: 200,
            headers: {"Content-Type": "application/json"},
          });
        }
        return originalFetch(input, init);
      };

      localStorage.setItem("presetStyle", "fmgStyle_missing-style");
      localStorage.removeItem("fmgStyle_missing-style");
      await w.changeStyle("fmgStyle_missing-style");

      localStorage.setItem("presetStyle", "fmgStyle_invalid-style");
      localStorage.setItem("fmgStyle_invalid-style", "not-json");
      await w.changeStyle("fmgStyle_invalid-style");
    });

    await expect(stylePanel).toContainText("default");
    await expect(stylePanel).toContainText("system");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("presetStyle"))).toBe("default");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioStyleFallbackRestore;
      if (!restore) return;
      w.fetch = restore.fetch;
      localStorage.removeItem("fmgStyle_invalid-style");
      delete w.__studioStyleFallbackRestore;
    });
  });

  test("keeps Style workspace summary stable when style preset change is canceled and updates after confirm", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);

    const stylePanel = page.locator(".studio-sidebar--right .studio-panel").first();

    await page.evaluate(async () => {
      const w = window as any;
      const originalFetch = w.fetch.bind(w);
      const originalDialog = w.confirmationDialog;
      const originalApply = w.applyStyleWithUiRefresh;
      const styleSelect = w.stylePreset as HTMLSelectElement | undefined;

      w.__studioStyleConfirmRestore = {
        fetch: originalFetch,
        confirmationDialog: originalDialog,
        applyStyleWithUiRefresh: originalApply,
        oldValue: styleSelect?.dataset.old,
        currentValue: styleSelect?.value,
      };

      w.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/styles/night.json") || url.includes("/styles/clean.json")) {
          return new Response(JSON.stringify({"#map": {"background-color": "#202020"}}), {
            status: 200,
            headers: {"Content-Type": "application/json"},
          });
        }
        return originalFetch(input, init);
      };

      w.applyStyleWithUiRefresh = (style: unknown) => {
        originalApply(style);
        if (styleSelect) styleSelect.value = localStorage.getItem("presetStyle") || styleSelect.value;
      };

      localStorage.setItem("presetStyle", "night");
      if (styleSelect) {
        styleSelect.value = "night";
        styleSelect.dataset.old = "night";
      }
      sessionStorage.removeItem("styleChangeConfirmed");

      w.confirmationDialog = ({onCancel}: {onCancel?: () => void}) => {
        onCancel?.();
      };
      if (styleSelect) styleSelect.value = "clean";
      w.requestStylePresetChange("clean");

      w.confirmationDialog = ({onConfirm}: {onConfirm?: () => void}) => {
        onConfirm?.();
      };
      if (styleSelect) styleSelect.value = "clean";
      await w.requestStylePresetChange("clean");
    });

    await expect(stylePanel).toContainText("clean");
    await expect(stylePanel).toContainText("system");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("presetStyle"))).toBe("clean");
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("styleChangeConfirmed"))).toBe("true");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioStyleConfirmRestore;
      if (!restore) return;
      const styleSelect = w.stylePreset as HTMLSelectElement | undefined;
      w.fetch = restore.fetch;
      w.confirmationDialog = restore.confirmationDialog;
      w.applyStyleWithUiRefresh = restore.applyStyleWithUiRefresh;
      if (styleSelect) {
        styleSelect.dataset.old = restore.oldValue || "";
        styleSelect.value = restore.currentValue || styleSelect.value;
      }
      sessionStorage.removeItem("styleChangeConfirmed");
      delete w.__studioStyleConfirmRestore;
    });
  });

  test("keeps Layers and Project summaries on custom when visible layers no longer match a preset", async ({page}) => {
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await page.evaluate(() => {
      localStorage.setItem("preset", "political");
      const labels = document.getElementById("toggleLabels");
      labels?.classList.add("buttonoff");
      (window as any).getCurrentPreset?.();
    });

    await layersNav.click();
    const layersSummaryPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect.poll(() => layersSummaryPanel.textContent()).toContain("custom");

    await projectNav.click();
    const workspacePanel = projectMapSettingsPanel(page);
    await expect.poll(() => workspacePanel.textContent()).toContain("custom");
    await expect.poll(() => page.evaluate(() => {
      const preset = (document.getElementById("layersPreset") as HTMLSelectElement | null)?.value;
      return {preset, stored: localStorage.getItem("preset")};
    })).toEqual({preset: "custom", stored: "political"});
  });

  test("keeps Project workspace autosave summary aligned when the interval toggles between off and on", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);

    const workspacePanel = projectMapSettingsPanel(page);

    await page.evaluate(() => {
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "0";
    });
    await expect.poll(() => workspacePanel.textContent()).toContain("Off");

    await page.evaluate(() => {
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "20";
    });
    await expect.poll(() => workspacePanel.textContent()).toContain("20 min");

    await page.evaluate(() => {
      const autosaveOutput = document.getElementById("autosaveIntervalOutput") as HTMLInputElement | null;
      if (autosaveOutput) autosaveOutput.value = "0";
    });
    await expect.poll(() => workspacePanel.textContent()).toContain("Off");
  });

  test("writes back snapshot state from legacy indexedDB storage", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});

    await expect(snapshotRow).toContainText("None");

    await page.evaluate(() => {
      localStorage.removeItem("lastMap");
      sessionStorage.removeItem("lastMap");
    });
    await setIndexedDbSnapshot(page, "indexeddb-snapshot");

    await page.locator("[data-studio-action='section'][data-value='project']").click();
    await dataNav.click();

    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      localStorage.removeItem("lastMap");
      sessionStorage.removeItem("lastMap");
    });
    await resetIndexedDbSnapshot(page);
  });

  test("keeps Studio data state consistent after quick load writes back document metadata", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    const sourceRow = dataPanel.locator(".studio-kv").filter({hasText: /^Source/});
    const loadDetailRow = dataPanel.locator(".studio-kv").filter({hasText: /^Load detail/});

    await page.evaluate(() => {
      const w = window as any;
      const originalQuickLoad = w.quickLoad;
      const originalSeed = w.seed;
      const originalMapName = w.mapName?.value;

      w.__studioQuickLoadConsistencyRestore = {
        quickLoad: originalQuickLoad,
        seed: originalSeed,
        mapName: originalMapName,
      };

      w.quickLoad = async () => {
        w.seed = "quick-load-seed";
        if (w.mapName) w.mapName.value = "Quick Load Map";
        localStorage.setItem("lastMap", JSON.stringify({id: "quick-load-snapshot"}));
      };
    });

    await dataPanel.getByRole("button", {name: "Quick load"}).click();

    await expect(dataNav).toHaveClass(/is-active/);
    await expect(seedRow).toContainText("quick-load-seed");
    await expect(snapshotRow).toContainText("Available");
    await expect(sourceRow).toContainText("Browser snapshot");
    await expect(loadDetailRow).toContainText("Quick load");

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("Quick Load Map");
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("quick-load-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioQuickLoadConsistencyRestore;
      if (!restore) return;

      w.quickLoad = restore.quickLoad;
      w.seed = restore.seed;
      if (w.mapName) w.mapName.value = restore.mapName || "";
      localStorage.removeItem("lastMap");
      delete w.__studioQuickLoadConsistencyRestore;
    });
  });

  test("keeps Studio data state stable when open file only opens the picker", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "open-file-baseline";
      if (w.mapName) w.mapName.value = "Open File Baseline";
      localStorage.setItem("lastMap", JSON.stringify({id: "open-file-baseline"}));
    });

    await page.locator("[data-studio-action='section'][data-value='project']").click();
    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});
    const sourceRow = dataPanel.locator(".studio-kv").filter({hasText: /^Source/});
    const loadDetailRow = dataPanel.locator(".studio-kv").filter({hasText: /^Load detail/});

    await expect(seedRow).toContainText("open-file-baseline");
    await expect(snapshotRow).toContainText("Available");

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);

      w.__studioOpenFileConsistencyRestore = {
        fileInput,
        click: originalFileInputClick,
      };
      w.__studioOpenFileClicks = 0;

      if (fileInput) {
        fileInput.click = () => {
          w.__studioOpenFileClicks += 1;
        };
      }
    });

    await dataPanel.getByRole("button", {name: "Open file"}).click();

    await expect(dataNav).toHaveClass(/is-active/);
    await expect(seedRow).toContainText("open-file-baseline");
    await expect(snapshotRow).toContainText("Available");
    await expect(sourceRow).toContainText("Generated");
    await expect(loadDetailRow).toContainText("Current settings");
    await expect.poll(() => page.evaluate(() => (window as any).__studioOpenFileClicks)).toBe(1);

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioOpenFileConsistencyRestore;
      if (!restore) return;

      if (restore.fileInput && restore.click) {
        restore.fileInput.click = restore.click;
      }
      localStorage.removeItem("lastMap");
      delete w.__studioOpenFileClicks;
      delete w.__studioOpenFileConsistencyRestore;
    });
  });

  test("re-syncs Studio state after a partial quick load failure", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});

    await page.evaluate(() => {
      const w = window as any;
      const originalQuickLoad = w.quickLoad;
      const originalSeed = w.seed;
      const originalMapName = w.mapName?.value;

      w.__studioQuickLoadFailureRestore = {
        quickLoad: originalQuickLoad,
        seed: originalSeed,
        mapName: originalMapName,
      };

      w.quickLoad = async () => {
        w.seed = "failed-quick-load-seed";
        if (w.mapName) w.mapName.value = "Failed Quick Load Map";
        localStorage.setItem("lastMap", JSON.stringify({id: "failed-quick-load"}));
        throw new Error("quick load aborted");
      };
    });

    await dataPanel.getByRole("button", {name: "Quick load"}).click();

    await expect(seedRow).toContainText("failed-quick-load-seed");
    await expect(snapshotRow).toContainText("Available");

    await projectNav.click();
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("Failed Quick Load Map");
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("failed-quick-load-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioQuickLoadFailureRestore;
      if (!restore) return;

      w.quickLoad = restore.quickLoad;
      w.seed = restore.seed;
      if (w.mapName) w.mapName.value = restore.mapName || "";
      localStorage.removeItem("lastMap");
      delete w.__studioQuickLoadFailureRestore;
    });
  });

  test("re-syncs Studio state after an open file cancel path mutates legacy metadata", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const seedRow = dataPanel.locator(".studio-kv").filter({hasText: "Seed"});
    const snapshotRow = dataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/});

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalSeed = w.seed;
      const originalMapName = w.mapName?.value;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);

      w.__studioOpenFileFailureRestore = {
        fileInput,
        seed: originalSeed,
        mapName: originalMapName,
        click: originalFileInputClick,
      };

      if (fileInput) {
        fileInput.click = () => {
          w.seed = "open-file-cancel-seed";
          if (w.mapName) w.mapName.value = "Open File Cancel Map";
          localStorage.setItem("lastMap", JSON.stringify({id: "open-file-cancel"}));
          throw new Error("picker canceled");
        };
      }
    });

    await dataPanel.getByRole("button", {name: "Open file"}).click();

    await expect(seedRow).toContainText("open-file-cancel-seed");
    await expect(snapshotRow).toContainText("Available");

    await projectNav.click();
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("Open File Cancel Map");
    await expect(page.locator(".studio-sidebar--right .studio-panel").first()).toContainText("open-file-cancel-seed");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioOpenFileFailureRestore;
      if (!restore) return;

      w.seed = restore.seed;
      if (w.mapName) w.mapName.value = restore.mapName || "";
      if (restore.fileInput && restore.click) {
        restore.fileInput.click = restore.click;
      }
      localStorage.removeItem("lastMap");
      delete w.__studioOpenFileFailureRestore;
    });
  });

  test("writes back Studio document state after selecting a map file via Open file", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const initialMapId = await page.evaluate(() => (window as any).mapId);
    const mapFilePath = path.join(__dirname, "../fixtures/demo.map");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      dataPanel.getByRole("button", {name: "Open file"}).click(),
    ]);
    await fileChooser.setFiles(mapFilePath);

    await page.waitForFunction(previousMapId => (window as any).mapId !== previousMapId, initialMapId, {timeout: 120000});
    await page.waitForTimeout(500);

    const legacyDocument = await page.evaluate(() => ({
      name: (window as any).mapName?.value || "",
      seed: (window as any).seed || (window as any).optionsSeed?.value || "",
      hasSnapshot: Boolean(localStorage.getItem("lastMap") || sessionStorage.getItem("lastMap")),
    }));

    expect(legacyDocument.name.length).toBeGreaterThan(0);
    expect(legacyDocument.seed.length).toBeGreaterThan(0);

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const refreshedDataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect(refreshedDataPanel.locator(".studio-kv").filter({hasText: "Seed"})).toContainText(legacyDocument.seed);
    await expect(refreshedDataPanel.locator(".studio-kv").filter({hasText: /^Snapshot/})).toContainText(
      legacyDocument.hasSnapshot ? "Available" : "None",
    );
    await expect(refreshedDataPanel.locator(".studio-kv").filter({hasText: /^Source/})).toContainText("Local file");
    await expect(refreshedDataPanel.locator(".studio-kv").filter({hasText: /^Load detail/})).toContainText("demo.map");

    await projectNav.click();
    const projectPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect(projectPanel).toContainText(legacyDocument.name);
    await expect(projectPanel).toContainText(legacyDocument.seed);
  });

  test("tracks dirty state across save, quick load, new map and open file flows", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});
    const initialMapId = await page.evaluate(() => (window as any).mapId);
    const mapFilePath = path.join(__dirname, "../fixtures/demo.map");

    await expect(dirtyRow).toContainText("No");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "dirty-seed";
      if (w.mapName) w.mapName.value = "Dirty Map";
    });

    await projectNav.click();
    await dataNav.click();
    await expect(dirtyRow).toContainText("Yes");

    await dataPanel.getByRole("button", {name: "Save to storage"}).click();
    await expect(dirtyRow).toContainText("No");

    await page.evaluate(() => {
      const w = window as any;
      w.seed = "dirty-again-seed";
    });
    await projectNav.click();
    await dataNav.click();
    await expect(dirtyRow).toContainText("Yes");

    await dataPanel.getByRole("button", {name: "Quick load"}).click();
    await expect(dirtyRow).toContainText("No");

    const pendingCanvasSize = await page.evaluate(() => {
      const w = window as any;
      const nextWidth = Number(w.graphWidth || w.mapWidthInput?.value || 0) + 111;
      const nextHeight = Number(w.graphHeight || w.mapHeightInput?.value || 0) + 77;
      w.seed = "dirty-before-new-map";
      if (w.optionsSeed) {
        w.optionsSeed.value = "dirty-before-new-map";
        w.optionsSeed.dispatchEvent(new Event("input", {bubbles: true}));
        w.optionsSeed.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (w.mapName) w.mapName.value = "Dirty Before New Map";
      w.graphWidth = nextWidth;
      w.graphHeight = nextHeight;
      if (w.mapWidthInput) {
        w.mapWidthInput.value = String(nextWidth);
        w.mapWidthInput.dispatchEvent(new Event("input", {bubbles: true}));
        w.mapWidthInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (w.mapHeightInput) {
        w.mapHeightInput.value = String(nextHeight);
        w.mapHeightInput.dispatchEvent(new Event("input", {bubbles: true}));
        w.mapHeightInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      return {width: String(nextWidth), height: String(nextHeight)};
    });
    await projectNav.click();
    await dataNav.click();
    await expect.poll(() => page.evaluate(() => ({
      width: String((window as any).mapWidthInput?.value || ""),
      height: String((window as any).mapHeightInput?.value || ""),
    }))).toEqual({
      width: pendingCanvasSize.width,
      height: pendingCanvasSize.height,
    });

    await dataPanel.getByRole("button", {name: "New map"}).click();
    await expect.poll(() => page.evaluate(() => (window as any).mapId)).not.toBe(initialMapId);
    await expect(dirtyRow).toContainText("No");

    const pendingOpenFileSize = await page.evaluate(() => {
      const w = window as any;
      const nextWidth = Number(w.graphWidth || w.mapWidthInput?.value || 0) + 59;
      const nextHeight = Number(w.graphHeight || w.mapHeightInput?.value || 0) + 41;
      w.seed = "dirty-before-open-file";
      if (w.mapName) w.mapName.value = "Dirty Before Open File";
      if (w.mapWidthInput) {
        w.mapWidthInput.value = String(nextWidth);
        w.mapWidthInput.dispatchEvent(new Event("input", {bubbles: true}));
        w.mapWidthInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      if (w.mapHeightInput) {
        w.mapHeightInput.value = String(nextHeight);
        w.mapHeightInput.dispatchEvent(new Event("input", {bubbles: true}));
        w.mapHeightInput.dispatchEvent(new Event("change", {bubbles: true}));
      }
      return {width: String(nextWidth), height: String(nextHeight)};
    });
    await projectNav.click();
    await dataNav.click();
    await expect.poll(() => page.evaluate(() => ({
      width: String((window as any).mapWidthInput?.value || ""),
      height: String((window as any).mapHeightInput?.value || ""),
    }))).toEqual({
      width: pendingOpenFileSize.width,
      height: pendingOpenFileSize.height,
    });

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      dataPanel.getByRole("button", {name: "Open file"}).click(),
    ]);
    await fileChooser.setFiles(mapFilePath);

    await page.waitForFunction(previousMapId => (window as any).mapId !== previousMapId, await page.evaluate(() => (window as any).mapId), {
      timeout: 120000,
    });
    await page.waitForTimeout(500);

    await dataNav.click();
    await expect(dirtyRow).toContainText("No");
  });

  test("keeps dirty state after an open file cancel path mutates legacy metadata", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});

    await expect(dirtyRow).toContainText("No");

    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;
      const originalFileInputClick = fileInput?.click?.bind(fileInput);

      w.__studioOpenFileDirtyRestore = {
        fileInput,
        click: originalFileInputClick,
      };

      if (fileInput) {
        fileInput.click = () => {
          w.seed = "open-file-cancel-dirty-seed";
          if (w.mapName) w.mapName.value = "Open File Cancel Dirty Map";
          throw new Error("picker canceled");
        };
      }
    });

    await dataPanel.getByRole("button", {name: "Open file"}).click();
    await projectNav.click();
    await dataNav.click();

    await expect(dirtyRow).toContainText("Yes");

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioOpenFileDirtyRestore;
      if (!restore) return;

      if (restore.fileInput && restore.click) {
        restore.fileInput.click = restore.click;
      }
      delete w.__studioOpenFileDirtyRestore;
    });
  });

  test("keeps dirty state after a partial quick load failure mutates legacy metadata", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const dirtyRow = dataPanel.locator(".studio-kv").filter({has: page.locator("span", {hasText: "Dirty"})});

    await page.evaluate(() => {
      const w = window as any;
      const originalQuickLoad = w.quickLoad;
      w.__studioQuickLoadDirtyRestore = originalQuickLoad;
      w.quickLoad = async () => {
        w.seed = "quick-load-dirty-seed";
        throw new Error("quick load aborted");
      };
    });

    await dataPanel.getByRole("button", {name: "Quick load"}).click();
    await projectNav.click();
    await dataNav.click();

    await expect(dirtyRow).toContainText("Yes");

    await page.evaluate(() => {
      const w = window as any;
      if (w.__studioQuickLoadDirtyRestore) {
        w.quickLoad = w.__studioQuickLoadDirtyRestore;
        delete w.__studioQuickLoadDirtyRestore;
      }
    });
  });

  test("disables unavailable data actions in the Studio shell", async ({page}) => {
    await page.evaluate(() => {
      const w = window as any;
      const fileInput = document.getElementById("mapToLoad") as HTMLInputElement | null;

      w.__studioDataAvailabilityRestore = {
        quickLoad: w.quickLoad,
        saveMap: w.saveMap,
        generateMapOnLoad: w.generateMapOnLoad,
        loadURL: w.loadURL,
        connectToDropbox: w.connectToDropbox,
        loadFromDropbox: w.loadFromDropbox,
        createSharableDropboxLink: w.createSharableDropboxLink,
        fileInput,
      };

      w.quickLoad = undefined;
      w.saveMap = undefined;
      w.generateMapOnLoad = undefined;
      w.loadURL = undefined;
      w.connectToDropbox = undefined;
      w.loadFromDropbox = undefined;
      w.createSharableDropboxLink = undefined;
      fileInput?.remove();
    });

    await page.locator("[data-studio-action='section'][data-value='project']").click();
    await page.locator("[data-studio-action='section'][data-value='data']").click();

    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    await expect(dataPanel.getByRole("button", {name: "Quick load"})).toBeDisabled();
    await expect(dataPanel.getByRole("button", {name: "Save to storage"})).toBeDisabled();
    await expect(dataPanel.getByRole("button", {name: "Download"})).toBeDisabled();
    await expect(dataPanel.getByRole("button", {name: "New map"})).toBeDisabled();
    await expect(dataPanel.getByRole("button", {name: "Open file"})).toBeDisabled();

    const dropboxDetails = await openDataDropboxDetails(page);
    await expect(dropboxDetails.getByRole("button", {name: "Save Dropbox"})).toBeDisabled();
    await expect(dropboxDetails.getByRole("button", {name: "Connect Dropbox"})).toBeDisabled();
    await expect(dropboxDetails.getByRole("button", {name: "Load Dropbox"})).toBeDisabled();
    await expect(dropboxDetails.getByRole("button", {name: "Share Dropbox"})).toBeDisabled();

    const advancedLoadingDetails = await openDataAdvancedLoadingDetails(page);
    await expect(advancedLoadingDetails.getByRole("button", {name: "Load URL"})).toBeDisabled();

    await page.evaluate(() => {
      const w = window as any;
      const restore = w.__studioDataAvailabilityRestore;
      if (!restore) return;

      w.quickLoad = restore.quickLoad;
      w.saveMap = restore.saveMap;
      w.generateMapOnLoad = restore.generateMapOnLoad;
      w.loadURL = restore.loadURL;
      w.connectToDropbox = restore.connectToDropbox;
      w.loadFromDropbox = restore.loadFromDropbox;
      w.createSharableDropboxLink = restore.createSharableDropboxLink;
      if (restore.fileInput && !document.getElementById("mapToLoad")) {
        document.body.appendChild(restore.fileInput);
      }
      delete w.__studioDataAvailabilityRestore;
    });
  });
});
