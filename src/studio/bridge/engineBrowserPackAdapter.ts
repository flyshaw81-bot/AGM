import { getBrowserRuntimePack } from "../../modules/engine-browser-runtime-globals";
import type { PackedGraph } from "../../types/PackedGraph";

export function getBrowserPack(): PackedGraph | undefined {
  return getBrowserRuntimePack();
}
