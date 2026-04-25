import {test, expect} from "@playwright/test";

test.describe.configure({timeout: 90000});

function editorDialog(page: Parameters<typeof test>[0]["page"], editorId: string) {
  return page.locator(`.ui-dialog:has(#${editorId})`);
}

function editorButton(page: Parameters<typeof test>[0]["page"], action: string) {
  return page.locator(`[data-studio-action='editor'][data-value='${action}']`);
}

function openEditorsWorkspace(page: Parameters<typeof test>[0]["page"]) {
  return page.locator("[data-studio-action='section'][data-value='editors']").click();
}

async function expectEditorState(
  page: Parameters<typeof test>[0]["page"],
  label: string,
  dialogId: string,
) {
  const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
  const statusBar = page.locator(".studio-statusbar");

  await expect(editorsPanel).toContainText(`Open · ${label}`);
  await expect(editorsPanel).toContainText(`#${dialogId}`);
  await expect(statusBar).toContainText(`Editor: Open · ${label}`);
}

async function openEditor(
  page: Parameters<typeof test>[0]["page"],
  action: string,
  dialogId: string,
) {
  await editorButton(page, action).click();
  await editorDialog(page, dialogId).waitFor({state: "visible", timeout: 5000});
}

async function closeEditor(page: Parameters<typeof test>[0]["page"], dialogId: string) {
  await page.click(`.ui-dialog:has(#${dialogId}) .ui-dialog-titlebar-close`);
}

async function closeEditorFromLegacy(page: Parameters<typeof test>[0]["page"], dialogId: string) {
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

async function openEditorFromLegacy(page: Parameters<typeof test>[0]["page"], action: string, dialogId: string) {
  await page.evaluate(async (editorAction: string) => {
    const handler = (window as Record<string, unknown>)[editorAction];
    if (typeof handler === "function") await (handler as () => unknown)();
  }, action);
  await editorDialog(page, dialogId).waitFor({state: "visible", timeout: 5000});
}

async function getVisibleDialogCount(page: Parameters<typeof test>[0]["page"]) {
  return page.locator(".ui-dialog").evaluateAll(dialogs =>
    dialogs.filter(dialog => {
      const element = dialog as HTMLElement;
      if (element.hidden || element.offsetParent === null) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length,
  );
}

const editorCases = [
  {action: "editStates", dialogId: "statesEditor", label: "States"},
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

  test("remembers the origin section and supports returning without closing the editor", async ({page}) => {
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const firstEditor = editorCases[0];

    await openEditorsWorkspace(page);
    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Canvas");

    await openEditor(page, firstEditor.action, firstEditor.dialogId);
    await expect(editorsPanel).toContainText("Active");
    await expect(editorsPanel).toContainText(firstEditor.label);
    await expect(editorsPanel.getByRole("button", {name: "Back to Canvas"})).toBeVisible();
    await expectEditorState(page, firstEditor.label, firstEditor.dialogId);

    await editorsPanel.getByRole("button", {name: "Back to Canvas"}).click();
    await expect(canvasNav).toHaveClass(/is-active/);
    await editorDialog(page, firstEditor.dialogId).waitFor({state: "visible", timeout: 5000});
    await expect(page.locator(".studio-statusbar")).toContainText(`Editor: Open · ${firstEditor.label}`);
  });

  test("keeps shell state aligned while switching across legacy editors", async ({page}) => {
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");

    await openEditorsWorkspace(page);

    for (const [index, editorCase] of editorCases.entries()) {
      await openEditor(page, editorCase.action, editorCase.dialogId);
      await expect(editorsNav).toHaveClass(/is-active/);
      await expectEditorState(page, editorCase.label, editorCase.dialogId);

      if (index > 0) {
        const previousEditor = editorCases[index - 1];
        await expect(editorDialog(page, previousEditor.dialogId)).toBeHidden();
      }
    }
  });

  test("keeps the same legacy dialog stable when reopening the active editor", async ({page}) => {
    const editorCase = editorCases[0];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    const firstDialogHandle = await editorDialog(page, editorCase.dialogId).elementHandle();
    expect(firstDialogHandle).not.toBeNull();
    const visibleBeforeReopen = await getVisibleDialogCount(page);

    await editorButton(page, editorCase.action).click();

    await expectEditorState(page, editorCase.label, editorCase.dialogId);
    await expect(editorDialog(page, editorCase.dialogId)).toBeVisible();
    await expect.poll(() => getVisibleDialogCount(page), {timeout: 5000}).toBe(visibleBeforeReopen);

    const reopenedDialogHandle = await editorDialog(page, editorCase.dialogId).elementHandle();
    expect(reopenedDialogHandle).toBeTruthy();
    expect(await reopenedDialogHandle!.evaluate((node, first) => node === first, firstDialogHandle)).toBe(true);
  });

  test("tracks a legacy-side close and allows reopening from the shell", async ({page}) => {
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[1];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await closeEditorFromLegacy(page, editorCase.dialogId);
    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorsWorkspace(page);
    await expect(editorsPanel).toContainText("Status");
    await expect(editorsPanel).toContainText("Closed");
    await expect(editorsPanel).toContainText("Dialog");
    await expect(editorsPanel).toContainText("—");

    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label, editorCase.dialogId);
  });

  test("keeps the returned section stable when the legacy dialog closes afterwards", async ({page}) => {
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[0];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await editorsPanel.getByRole("button", {name: "Back to Canvas"}).click();

    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(editorDialog(page, editorCase.dialogId)).toBeVisible();
    await expect(statusBar).toContainText(`Editor: Open · ${editorCase.label}`);

    await closeEditorFromLegacy(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Canvas");
  });

  test("enters and exits the editors workflow when a legacy editor opens outside the shell", async ({page}) => {
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const statusBar = page.locator(".studio-statusbar");
    const editorCase = editorCases[2];

    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorFromLegacy(page, editorCase.action, editorCase.dialogId);

    await expect.poll(async () => await page.locator(".studio-nav__item.is-active").textContent(), {timeout: 5000}).toContain("Editors");
    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Canvas");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await closeEditorFromLegacy(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can close the active editor directly from the Studio shell", async ({page}) => {
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const statusBar = page.locator(".studio-statusbar");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[4];

    await openEditorsWorkspace(page);
    await openEditor(page, editorCase.action, editorCase.dialogId);
    await expectEditorState(page, editorCase.label, editorCase.dialogId);
    await expect(editorsPanel.getByRole("button", {name: "Close editor"})).toBeVisible();

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Canvas");
  });

  test("can open the suggested editor directly from the Canvas workspace", async ({page}) => {
    const canvasNav = page.locator("[data-studio-action='section'][data-value='canvas']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const canvasPanel = page.locator(".studio-sidebar--right .studio-panel").nth(1);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[0];

    await canvasNav.click();
    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(canvasPanel.getByRole("button", {name: "Open States editor"})).toBeVisible();

    await canvasPanel.getByRole("button", {name: "Open States editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Canvas");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(canvasNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can open the suggested editor directly from the Project workspace", async ({page}) => {
    const projectNav = page.locator("[data-studio-action='section'][data-value='project']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const projectPanel = page.locator(".studio-sidebar--right .studio-panel").nth(2);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[0];

    await projectNav.click();
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(projectPanel.getByRole("button", {name: "Open States editor"})).toBeVisible();

    await projectPanel.getByRole("button", {name: "Open States editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Project");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(projectNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can open the suggested editor directly from the Style workspace", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const stylePanel = page.locator(".studio-sidebar--right .studio-panel").nth(2);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[3];

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(stylePanel.getByRole("button", {name: "Open Biomes editor"})).toBeVisible();

    await stylePanel.getByRole("button", {name: "Open Biomes editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Style");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can open the suggested editor directly from the Layers workspace", async ({page}) => {
    const layersNav = page.locator("[data-studio-action='section'][data-value='layers']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const layersPanel = page.locator(".studio-sidebar--right .studio-panel").nth(1);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[0];

    await layersNav.click();
    await expect(layersNav).toHaveClass(/is-active/);
    await expect(layersPanel.getByRole("button", {name: "Open States editor"})).toBeVisible();

    await layersPanel.getByRole("button", {name: "Open States editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Layers");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(layersNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can open the suggested editor directly from the Export workspace", async ({page}) => {
    const exportNav = page.locator("[data-studio-action='section'][data-value='export']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const exportPanel = page.locator(".studio-sidebar--right .studio-panel").nth(1);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[4];

    await exportNav.click();
    await expect(exportNav).toHaveClass(/is-active/);
    await expect(exportPanel.getByRole("button", {name: "Open Provinces editor"})).toBeVisible();

    await exportPanel.getByRole("button", {name: "Open Provinces editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Export");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(exportNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("can open the suggested editor directly from the Data workspace", async ({page}) => {
    const dataNav = page.locator("[data-studio-action='section'][data-value='data']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const dataPanel = page.locator(".studio-sidebar--right .studio-panel").nth(1);
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const editorCase = editorCases[0];

    await dataNav.click();
    await expect(dataNav).toHaveClass(/is-active/);
    await expect(dataPanel.getByRole("button", {name: "Open States editor"})).toBeVisible();

    await dataPanel.getByRole("button", {name: "Open States editor"}).click();

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Data");
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await editorsPanel.getByRole("button", {name: "Close editor"}).click();

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect(dataNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
  });

  test("returns to the original non-canvas section after a legacy-opened editor closes", async ({page}) => {
    const styleNav = page.locator("[data-studio-action='section'][data-value='style']");
    const editorsNav = page.locator("[data-studio-action='section'][data-value='editors']");
    const editorsPanel = page.locator(".studio-sidebar--right .studio-panel").first();
    const statusBar = page.locator(".studio-statusbar");
    const editorCase = editorCases[3];

    await styleNav.click();
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);

    await openEditorFromLegacy(page, editorCase.action, editorCase.dialogId);

    await expect(editorsNav).toHaveClass(/is-active/);
    await expect(editorsPanel).toContainText("Origin");
    await expect(editorsPanel).toContainText("Style");
    await expect(editorsPanel.getByRole("button", {name: "Back to Style"})).toBeVisible();
    await expectEditorState(page, editorCase.label, editorCase.dialogId);

    await closeEditorFromLegacy(page, editorCase.dialogId);

    await expect(editorDialog(page, editorCase.dialogId)).toBeHidden();
    await expect.poll(async () => await statusBar.textContent(), {timeout: 5000}).toContain("Editor: Closed");
    await expect(styleNav).toHaveClass(/is-active/);
    await expect(editorsNav).not.toHaveClass(/is-active/);
    await expect(page.locator(".studio-nav__item.is-active")).toContainText("Style");
  });
});
