import type { StudioLanguage } from "../types";

const GENERATED_TEXT_TRANSLATIONS: Array<[RegExp, string]> = [
  [/spawn candidate/gi, "出生候选点"],
  [/state fair-start/gi, "国家公平开局"],
  [/route connector/gi, "路线连接"],
  [/support settlement/gi, "支援聚落"],
  [/settlement distribution/gi, "聚落分布"],
  [/biome habitability/gi, "生物群系宜居度"],
  [/resource coverage/gi, "资源覆盖"],
  [/province structure/gi, "省份结构"],
  [/profile default/gi, "类型默认值"],
  [/profile override/gi, "类型覆盖"],
  [/connectivity/gi, "连通性"],
  [/habitability/gi, "宜居度"],
  [/fairness/gi, "公平性"],
  [/settlement/gi, "聚落"],
  [/candidate/gi, "候选"],
  [/coverage/gi, "覆盖"],
  [/resource/gi, "资源"],
  [/province/gi, "省份"],
  [/biome/gi, "生物群系"],
  [/route/gi, "路线"],
  [/burg/gi, "城镇"],
  [/state/gi, "国家"],
  [/spawn/gi, "出生点"],
  [/profile/gi, "类型"],
  [/preview/gi, "预览"],
  [/draft/gi, "草稿"],
  [/apply/gi, "应用"],
  [/discard/gi, "丢弃"],
  [/increase/gi, "提高"],
  [/decrease/gi, "降低"],
  [/review/gi, "检查"],
  [/adjust/gi, "调整"],
  [/fix/gi, "修复"],
  [/risk/gi, "风险"],
  [/warning/gi, "警告"],
  [/score/gi, "评分"],
  [/target/gi, "目标"],
  [/changes/gi, "变更"],
  [/change/gi, "变更"],
  [/pending/gi, "待处理"],
  [/applied/gi, "已应用"],
  [/discarded/gi, "已丢弃"],
];

export function localizeGeneratedText(value: string, language: StudioLanguage) {
  if (language !== "zh-CN") return value;

  return GENERATED_TEXT_TRANSLATIONS.reduce(
    (translated, [pattern, replacement]) =>
      translated.replace(pattern, replacement),
    value,
  );
}
