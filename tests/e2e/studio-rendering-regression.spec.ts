import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 120000 });

async function clearBrowserState(page: import("@playwright/test").Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function openWorkbench(page: import("@playwright/test").Page) {
  const enterWorkbench = page
    .locator(
      "[data-studio-action='direct-workbench-jump'][data-value='states']",
    )
    .first();
  await expect(enterWorkbench).toBeVisible();
  await enterWorkbench.click();
  await expect(page.locator("#studioCanvasFrame")).toBeVisible();
  await expect(page.locator("[data-native-v8-bottom-bar='true']")).toBeVisible();
}

test("renders generated maps with native layer/style semantics", async ({
  page,
}) => {
  await clearBrowserState(page);
  await page.goto("/?seed=studio-rendering-regression&width=960&height=540", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => (window as any).mapId !== undefined, {
    timeout: 60000,
  });
  await openWorkbench(page);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const runtime = window as any;
        const layerIds = [
          "toggleStates",
          "toggleBorders",
          "toggleRoutes",
          "toggleRivers",
          "toggleBurgIcons",
          "toggleLabels",
          "toggleIce",
          "toggleScaleBar",
          "toggleVignette",
          "toggleMarkers",
          "toggleBiomes",
          "toggleHeight",
        ];

        return {
          activeLayers: layerIds.filter((id) => runtime.layerIsOn(id)),
          renderFunctions: [
            "drawStates",
            "drawBiomes",
            "drawCultures",
            "drawReligions",
            "drawProvinces",
            "drawZones",
            "drawRoutes",
            "drawRivers",
            "drawLabels",
          ].every((name) => typeof runtime[name] === "function"),
          counts: {
            states: document.querySelectorAll("#statesBody path").length,
            rivers: document.querySelectorAll("#rivers path").length,
            routes: document.querySelectorAll("#routes path").length,
            labels: document.querySelectorAll("#labels text").length,
            markers: document.querySelectorAll("#markers svg").length,
          },
          style: {
            landmassFill: document
              .querySelector("#landmass")
              ?.getAttribute("fill"),
            oceanFill: document
              .querySelector("#oceanBase")
              ?.getAttribute("fill"),
            statesBodyOpacity: document
              .querySelector("#statesBody")
              ?.getAttribute("opacity"),
            vignetteOpacity: document
              .querySelector("#vignette")
              ?.getAttribute("opacity"),
          },
          display: {
            markers: window.getComputedStyle(
              document.querySelector("#markers") as Element,
            ).display,
            rivers: window.getComputedStyle(
              document.querySelector("#rivers") as Element,
            ).display,
            vignette: window.getComputedStyle(
              document.querySelector("#vignette") as Element,
            ).display,
          },
        };
      }),
    )
    .toMatchObject({
      activeLayers: [
        "toggleStates",
        "toggleBorders",
        "toggleRoutes",
        "toggleRivers",
        "toggleBurgIcons",
        "toggleLabels",
        "toggleIce",
        "toggleScaleBar",
        "toggleVignette",
      ],
      renderFunctions: true,
      style: {
        landmassFill: "#eef6fb",
        oceanFill: "#466eab",
        statesBodyOpacity: "0.4",
        vignetteOpacity: "0.3",
      },
      display: {
        markers: "none",
        rivers: "inline",
        vignette: "inline",
      },
    });

  const counts = await page.evaluate(() => ({
    states: document.querySelectorAll("#statesBody path").length,
    rivers: document.querySelectorAll("#rivers path").length,
    routes: document.querySelectorAll("#routes path").length,
    labels: document.querySelectorAll("#labels text").length,
    markers: document.querySelectorAll("#markers svg").length,
  }));
  expect(counts.states).toBeGreaterThan(0);
  expect(counts.rivers).toBeGreaterThan(0);
  expect(counts.routes).toBeGreaterThan(0);
  expect(counts.labels).toBeGreaterThan(0);
  expect(counts.markers).toBe(0);
});

test("keeps native layerbar state synchronized with rendered SVG groups", async ({
  page,
}) => {
  await clearBrowserState(page);
  await page.goto("/?seed=studio-layerbar-regression&width=960&height=540", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => (window as any).mapId !== undefined, {
    timeout: 60000,
  });
  await openWorkbench(page);

  const riverLayer = page
    .locator("[data-studio-action='layer'][data-value='toggleRivers']")
    .first();
  await expect(riverLayer).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate(() => ({
        on: (window as any).layerIsOn("toggleRivers"),
        display: window.getComputedStyle(
          document.querySelector("#rivers") as Element,
        ).display,
        pathCount: document.querySelectorAll("#rivers path").length,
      })),
    )
    .toMatchObject({ on: true, display: "inline" });

  await riverLayer.click();
  await expect(riverLayer).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() =>
      page.evaluate(() => ({
        on: (window as any).layerIsOn("toggleRivers"),
        display: window.getComputedStyle(
          document.querySelector("#rivers") as Element,
        ).display,
        pathCount: document.querySelectorAll("#rivers path").length,
      })),
    )
    .toMatchObject({ on: false, display: "none" });

  await riverLayer.click();
  await expect(riverLayer).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.evaluate(() => ({
        on: (window as any).layerIsOn("toggleRivers"),
        display: window.getComputedStyle(
          document.querySelector("#rivers") as Element,
        ).display,
        pathCount: document.querySelectorAll("#rivers path").length,
      })),
    )
    .toMatchObject({ on: true, display: "inline" });
});
