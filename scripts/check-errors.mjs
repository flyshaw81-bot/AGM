// Check for browser console errors
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", err => errors.push(err.message));

await page.goto("http://127.0.0.1:5180/AGM-Studio/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(10000);

console.log("Browser errors:");
if (errors.length === 0) {
  console.log("No errors found!");
} else {
  errors.forEach(e => console.log(" -", e));
}

await browser.close();
