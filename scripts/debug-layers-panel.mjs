// Verify the layers panel renders correctly
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

// Navigate to layers section by clicking the layers button
const result = await page.evaluate(() => {
  // Find the layers button in the iconbar
  const layersBtn = document.querySelector('[data-studio-action="section"][data-value="layers"]');
  return {
    layersButtonExists: !!layersBtn,
    layersButtonText: layersBtn?.textContent?.trim(),
    layersButtonLabel: layersBtn?.querySelector(".studio-native-iconbar__item-label")?.textContent,
  };
});

console.log(JSON.stringify(result, null, 2));

// Click the layers button
await page.click('[data-studio-action="section"][data-value="layers"]');
await page.waitForTimeout(1000);

// Check what's rendered in the info panel
const panelResult = await page.evaluate(() => {
  const infoPanel = document.querySelector(".studio-native-v8-info-panel");
  if (!infoPanel) return { infoPanelExists: false };

  const sections = infoPanel.querySelectorAll(".studio-panel__title");
  const sectionTitles = [];
  sections.forEach(s => sectionTitles.push(s.textContent?.trim()));

  const chips = infoPanel.querySelectorAll(".studio-chip");
  const chipTexts = [];
  chips.forEach(c => chipTexts.push(c.textContent?.trim()));

  // Check if details element still exists
  const details = infoPanel.querySelector("details.studio-advanced-section");

  return {
    infoPanelExists: true,
    sectionTitles,
    totalChips: chips.length,
    chipTexts: chipTexts.slice(0, 30),
    hasDetailsFold: !!details,
    icePresent: [...chips].some(c => c.getAttribute("data-value") === "toggleIce"),
    iceVisible: (() => {
      const iceChip = [...chips].find(c => c.getAttribute("data-value") === "toggleIce");
      return iceChip?.classList.contains("is-active");
    })(),
  };
});

console.log(JSON.stringify(panelResult, null, 2));
await browser.close();
