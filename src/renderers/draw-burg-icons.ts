import type { Burg } from "../modules/burgs-generator";

declare global {
  var drawBurgIcons: () => void;
  var drawBurgIcon: (burg: Burg) => void;
  var removeBurgIcon: (burgId: number) => void;
}

interface BurgGroup {
  name: string;
  order: number;
}

export interface BurgIconRendererTargets {
  getDocument: () => Document | undefined;
  getElementById: (id: string) => Element | null;
  querySelector: <T extends Element>(selector: string) => T | null;
  querySelectorAll: (selector: string) => Element[];
}

const getDocument = (): Document | undefined => {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
};

export function createGlobalBurgIconRendererTargets(): BurgIconRendererTargets {
  return {
    getDocument,
    getElementById: (id) => getDocument()?.getElementById(id) ?? null,
    querySelector: (selector) => getDocument()?.querySelector(selector) ?? null,
    querySelectorAll: (selector) =>
      Array.from(getDocument()?.querySelectorAll(selector) ?? []),
  };
}

const defaultBurgIconRendererTargets = createGlobalBurgIconRendererTargets();

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

export const burgIconsRenderer = (
  targets: BurgIconRendererTargets = defaultBurgIconRendererTargets,
): void => {
  TIME && console.time("drawBurgIcons");
  createIconGroups(targets);
  const document = targets.getDocument();
  if (!document) return;

  for (const { name } of options.burgs.groups as BurgGroup[]) {
    const burgsInGroup = pack.burgs.filter(
      (b) => b.group === name && !b.removed,
    );
    if (!burgsInGroup.length) continue;

    const iconsGroup = targets.querySelector<SVGGElement>(
      `#burgIcons > g#${name}`,
    );
    if (!iconsGroup) continue;

    const icon = iconsGroup.dataset.icon || "#icon-circle";
    iconsGroup.innerHTML = burgsInGroup
      .map(
        (b) =>
          `<use id="burg${b.i}" data-id="${b.i}" href="${icon}" x="${b.x}" y="${b.y}"></use>`,
      )
      .join("");

    const portsInGroup = burgsInGroup.filter((b) => b.port);
    if (!portsInGroup.length) continue;

    const portGroup = targets.querySelector<SVGGElement>(
      `#anchors > g#${name}`,
    );
    if (!portGroup) continue;

    portGroup.innerHTML = portsInGroup
      .map(
        (b) =>
          `<use id="anchor${b.i}" data-id="${b.i}" href="#icon-anchor" x="${b.x}" y="${b.y}"></use>`,
      )
      .join("");
  }

  TIME && console.timeEnd("drawBurgIcons");
};

export const drawBurgIconRenderer = (
  burg: Burg,
  targets: BurgIconRendererTargets = defaultBurgIconRendererTargets,
): void => {
  const iconGroup = burgIcons.select<SVGGElement>(`#${burg.group}`);
  if (iconGroup.empty()) {
    burgIconsRenderer(targets);
    return; // redraw all icons if group is missing
  }

  removeBurgIconRenderer(burg.i!, targets);
  const icon = iconGroup.attr("data-icon") || "#icon-circle";
  burgIcons
    .select(`#${burg.group}`)
    .append("use")
    .attr("href", icon)
    .attr("id", `burg${burg.i}`)
    .attr("data-id", burg.i!)
    .attr("x", burg.x)
    .attr("y", burg.y);

  if (burg.port) {
    anchors
      .select(`#${burg.group}`)
      .append("use")
      .attr("href", "#icon-anchor")
      .attr("id", `anchor${burg.i}`)
      .attr("data-id", burg.i!)
      .attr("x", burg.x)
      .attr("y", burg.y);
  }
};

export const removeBurgIconRenderer = (
  burgId: number,
  targets: BurgIconRendererTargets = defaultBurgIconRendererTargets,
): void => {
  const existingIcon = targets.getElementById(`burg${burgId}`);
  if (existingIcon) existingIcon.remove();

  const existingAnchor = targets.getElementById(`anchor${burgId}`);
  if (existingAnchor) existingAnchor.remove();
};

function createIconGroups(targets: BurgIconRendererTargets): void {
  const document = targets.getDocument();
  if (!document) return;

  // save existing styles and remove all groups
  targets.querySelectorAll("g#burgIcons > g").forEach((group) => {
    style.burgIcons[group.id] = Array.from(group.attributes).reduce(
      (acc: { [key: string]: string }, attribute) => {
        acc[attribute.name] = attribute.value;
        return acc;
      },
      {},
    );
    group.remove();
  });

  targets.querySelectorAll("g#anchors > g").forEach((group) => {
    style.anchors[group.id] = Array.from(group.attributes).reduce(
      (acc: { [key: string]: string }, attribute) => {
        acc[attribute.name] = attribute.value;
        return acc;
      },
      {},
    );
    group.remove();
  });

  // create groups for each burg group and apply stored or default style
  const defaultIconStyle =
    style.burgIcons.town || Object.values(style.burgIcons)[0] || {};
  const defaultAnchorStyle =
    style.anchors.town || Object.values(style.anchors)[0] || {};
  const sortedGroups = [...(options.burgs.groups as BurgGroup[])].sort(
    (a, b) => a.order - b.order,
  );
  for (const { name } of sortedGroups) {
    const burgGroup = burgIcons.append("g");
    const iconStyles = style.burgIcons[name] || defaultIconStyle;
    Object.entries(iconStyles).forEach(([key, value]) => {
      burgGroup.attr(key, value);
    });
    burgGroup.attr("id", name);

    const anchorGroup = anchors.append("g");
    const anchorStyles = style.anchors[name] || defaultAnchorStyle;
    Object.entries(anchorStyles).forEach(([key, value]) => {
      anchorGroup.attr(key, value);
    });
    anchorGroup.attr("id", name);
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.drawBurgIcons = burgIconsRenderer;
  runtimeWindow.drawBurgIcon = drawBurgIconRenderer;
  runtimeWindow.removeBurgIcon = removeBurgIconRenderer;
}
