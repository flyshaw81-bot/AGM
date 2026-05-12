// Check iconbar DOM
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(12000);
await page.waitForFunction(() => !!window.__agmActiveEngineRuntimeContext?.pack?.cells?.p, { timeout: 30000 });

const result = await page.evaluate(() => {
  const iconbar = document.querySelector(".studio-native-iconbar");
  if (!iconbar) return { iconbarExists: false };

  // Get all buttons in iconbar
  const buttons = iconbar.querySelectorAll("button");
  const buttonInfo = [];
  buttons.forEach(btn => {
    buttonInfo.push({
      action: btn.getAttribute("data-studio-action"),
      value: btn.getAttribute("data-value"),
      target: btn.getAttribute("data-workbench-target"),
      label: btn.querySelector(".studio-native-iconbar__item-label")?.textContent?.trim(),
      text: btn.textContent?.trim()?.substring(0, 60),
    });
  });

  return {
    iconbarExists: true,
    buttonCount: buttons.length,
    buttons: buttonInfo,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
