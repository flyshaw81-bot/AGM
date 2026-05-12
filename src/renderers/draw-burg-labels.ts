import type { Burg } from "../modules/burgs-generator";
import type { EngineRuntimeContext } from "../modules/engine-runtime-context";
import { createBrowserRendererContext } from "./renderer-runtime-context";

declare global {
  var drawBurgLabels: () => void;
  var drawBurgLabel: (burg: Burg) => void;
  var removeBurgLabel: (burgId: number) => void;
}

interface BurgGroup {
  name: string;
  order: number;
}

export interface BurgLabelRendererTargets {
  getDocument: () => Document | undefined;
  getElementById: (id: string) => Element | null;
  querySelectorAll: (selector: string) => Element[];
}

const getDocument = (): Document | undefined => {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
};

export function createGlobalBurgLabelRendererTargets(): BurgLabelRendererTargets {
  return {
    getDocument,
    getElementById: (id) => getDocument()?.getElementById(id) ?? null,
    querySelectorAll: (selector) =>
      Array.from(getDocument()?.querySelectorAll(selector) ?? []),
  };
}

const defaultBurgLabelRendererTargets = createGlobalBurgLabelRendererTargets();

const getWindow = (): (Window & typeof globalThis) | undefined => {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
};

export const burgLabelsRenderer = (
  context: EngineRuntimeContext,
  targets: BurgLabelRendererTargets = defaultBurgLabelRendererTargets,
): void => {
  context.timing.shouldTime && console.time("drawBurgLabels");
  createLabelGroups(context, targets);

  for (const { name } of context.options.burgs.groups as BurgGroup[]) {
    const burgsInGroup = context.pack.burgs.filter(
      (b) => b.group === name && !b.removed,
    );
    if (!burgsInGroup.length) continue;

    const labelGroup = burgLabels.select<SVGGElement>(`#${name}`);
    if (labelGroup.empty()) continue;

    const dx = labelGroup.attr("data-dx") || 0;
    const dy = labelGroup.attr("data-dy") || 0;

    labelGroup
      .selectAll("text")
      .data(burgsInGroup)
      .enter()
      .append("text")
      .attr("text-rendering", "optimizeSpeed")
      .attr("id", (d) => `burgLabel${d.i}`)
      .attr("data-id", (d) => d.i!)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("dx", `${dx}em`)
      .attr("dy", `${dy}em`)
      .text((d) => d.name!);
  }

  context.timing.shouldTime && console.timeEnd("drawBurgLabels");
};

export const drawBurgLabelRenderer = (
  context: EngineRuntimeContext,
  burg: Burg,
  targets: BurgLabelRendererTargets = defaultBurgLabelRendererTargets,
): void => {
  const labelGroup = burgLabels.select<SVGGElement>(`#${burg.group}`);
  if (labelGroup.empty()) {
    burgLabelsRenderer(context, targets);
    return; // redraw all labels if group is missing
  }

  const dx = labelGroup.attr("data-dx") || 0;
  const dy = labelGroup.attr("data-dy") || 0;

  removeBurgLabelRenderer(burg.i!, targets);
  labelGroup
    .append("text")
    .attr("text-rendering", "optimizeSpeed")
    .attr("id", `burgLabel${burg.i}`)
    .attr("data-id", burg.i!)
    .attr("x", burg.x)
    .attr("y", burg.y)
    .attr("dx", `${dx}em`)
    .attr("dy", `${dy}em`)
    .text(burg.name!);
};

export const removeBurgLabelRenderer = (
  burgId: number,
  targets: BurgLabelRendererTargets = defaultBurgLabelRendererTargets,
): void => {
  const existingLabel = targets.getElementById(`burgLabel${burgId}`);
  if (existingLabel) existingLabel.remove();
};

function createLabelGroups(
  context: EngineRuntimeContext,
  targets: BurgLabelRendererTargets,
): void {
  const document = targets.getDocument();
  if (!document) return;

  // save existing styles and remove all groups
  targets.querySelectorAll("g#burgLabels > g").forEach((group) => {
    style.burgLabels[group.id] = Array.from(group.attributes).reduce(
      (acc: { [key: string]: string }, attribute) => {
        acc[attribute.name] = attribute.value;
        return acc;
      },
      {},
    );
    group.remove();
  });

  // create groups for each burg group and apply stored or default style
  const defaultStyle =
    style.burgLabels.town || Object.values(style.burgLabels)[0] || {};
  const sortedGroups = [...(context.options.burgs.groups as BurgGroup[])].sort(
    (a, b) => a.order - b.order,
  );
  for (const { name } of sortedGroups) {
    const group = burgLabels.append("g");
    const styles = style.burgLabels[name] || defaultStyle;
    Object.entries(styles).forEach(([key, value]) => {
      group.attr(key, value);
    });
    group.attr("id", name);
  }
}

const runtimeWindow = getWindow();
if (runtimeWindow) {
  runtimeWindow.drawBurgLabels = () =>
    burgLabelsRenderer(createBrowserRendererContext());
  runtimeWindow.drawBurgLabel = (burg) =>
    drawBurgLabelRenderer(createBrowserRendererContext(), burg);
  runtimeWindow.removeBurgLabel = removeBurgLabelRenderer;
}
