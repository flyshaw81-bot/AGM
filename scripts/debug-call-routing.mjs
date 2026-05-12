// Verify exactly how callOptionalDraw routes and which functions are missing
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

// Check which draw functions exist on globalThis
const check = await page.evaluate(() => {
  const names = [
    "drawTexture","drawHeightmap","drawBiomes","drawFeatures","drawCells",
    "drawGrid","drawCoordinates","drawRivers","drawReliefIcons",
    "drawReligions","drawCultures","drawStates","drawProvinces",
    "drawZones","drawBorders","drawRoutes","drawTemperature",
    "drawPopulation","drawIce","drawPrecipitation","drawEmblems",
    "drawLabels","drawBurgIcons","drawMilitary","drawMarkers",
  ];
  const results = {};
  for (const name of names) {
    results[name] = typeof window[name] === "function" ? "YES" : "NO";
  }

  // Test: manually call drawTexture if it exists
  let manualTextureResult = "not_tested";
  if (typeof window.drawTexture === "function") {
    try {
      window.drawTexture();
      manualTextureResult = "called";
    } catch(e) {
      manualTextureResult = "error: " + e.message;
    }
  }

  // Check #texture SVG element
  const textureEl = document.querySelector("#texture");
  const textureChildrenBefore = textureEl?.children.length || 0;

  // Try: manually invoke the drawFeatures-like approach for texture
  // Is there a texture renderer exported somewhere?
  return {
    results,
    manualTextureResult,
    textureElExists: !!textureEl,
    textureChildrenBefore,
    textureDisplay: textureEl ? getComputedStyle(textureEl).display : "MISSING",
    runtimeDrawLayersType: typeof window.drawLayers,
    runtimeDrawTexture: typeof window.drawTexture,
  };
});

console.log(JSON.stringify(check, null, 2));
await browser.close();
