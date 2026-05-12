// Screenshot DPAGM for comparison with AGM
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });

// ===== DPAGM =====
const page1 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const dpagmErrors = [];
page1.on("console", (msg) => {
  if (msg.type() === "error") dpagmErrors.push(msg.text());
});
page1.on("pageerror", (err) => dpagmErrors.push(err.message));

console.log("Screenshotting DPAGM (port 5180)...");
await page1.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page1.waitForTimeout(10000);
await page1.screenshot({ path: "D:/DPAGM/scripts/dpagm-current.png", fullPage: false });
console.log("DPAGM screenshot saved");

// ===== AGM =====
const page2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const agmErrors = [];
page2.on("console", (msg) => {
  if (msg.type() === "error") agmErrors.push(msg.text());
});
page2.on("pageerror", (err) => agmErrors.push(err.message));

console.log("Screenshotting AGM (port 5175)...");
await page2.goto("http://127.0.0.1:5175/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page2.waitForTimeout(10000);
await page2.screenshot({ path: "D:/DPAGM/scripts/agm-current.png", fullPage: false });
console.log("AGM screenshot saved");

console.log("\nDPAGM Errors:", dpagmErrors.length === 0 ? "none" : dpagmErrors.join("\n"));
console.log("AGM Errors:", agmErrors.length === 0 ? "none" : agmErrors.join("\n"));

await browser.close();
