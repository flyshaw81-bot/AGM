// Open workbench then check layers panel
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

// Click "进入工作台" or the current world
const workbenchBtn = page.locator('[data-studio-action="direct-workbench-jump"]').first();
if (await workbenchBtn.isVisible()) {
  await workbenchBtn.click();
  await page.waitForTimeout(3000);
}

const result = await page.evaluate(() => {
  const iconbar = document.querySelector(".studio-native-iconbar");
  if (!iconbar) return { iconbarExists: false, section: document.getElementById("studioRoot")?.getAttribute("data-studio-section") };

  const buttons = iconbar.querySelectorAll("button");
  const btnInfo = [];
  buttons.forEach(btn => {
    btnInfo.push({
      action: btn.getAttribute("data-studio-action"),
      value: btn.getAttribute("data-value"),
      label: btn.querySelector(".studio-native-iconbar__item-label")?.textContent?.trim(),
    });
  });

  return { iconbarExists: true, buttonCount: buttons.length, buttons: btnInfo };
});

console.log(JSON.stringify(result, null, 2));

// Now try to click the layers button if it exists
const layersBtn = page.locator('[data-studio-action="section"][data-value="layers"]');
if (await layersBtn.count() > 0) {
  await layersBtn.click();
  await page.waitForTimeout(1000);
}

// Check panel content
const panelResult = await page.evaluate(() => {
  const infoPanel = document.querySelector(".studio-native-v8-info-panel");
  if (!infoPanel) return { infoPanelExists: false };

  const titles = [];
  infoPanel.querySelectorAll(".studio-panel__title").forEach(s => titles.push(s.textContent?.trim()));

  const chips = [];
  infoPanel.querySelectorAll(".studio-chip").forEach(c => chips.push(c.textContent?.trim()));

  return {
    infoPanelExists: true,
    sectionTitles: titles,
    totalChips: chips.length,
    chipTexts: chips,
    iceChipExists: chips.some(c => c === "冰层" || c === "Ice"),
  };
});

console.log(JSON.stringify(panelResult, null, 2));
await browser.close();
