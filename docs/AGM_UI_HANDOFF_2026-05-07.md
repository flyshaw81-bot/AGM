# AGM Studio UI Handoff - 2026-05-08

## 项目一句话

AGM Studio 正在被重建为一个自研地图产品 UI，而不是套壳或重皮肤版 FMG 编辑器。

## 工作目录与本地地址

正式工作目录：

```text
D:\AGM\AGM-Studio
```

当前本地页面：

```text
http://127.0.0.1:5174/AGM-Studio/
```

如果服务没开，从 `D:\AGM\AGM-Studio` 启动开发服务。不要在 `D:\UIAGM` 里改正式代码；那个目录只是给其他 AI 实验用的副本。

## 用户核心要求

- 用中文沟通。
- 要具体实现，不要只给大计划。
- 不要回滚无关 dirty worktree。
- 搜索优先用 `rg`。
- 手工改文件用 `apply_patch`。
- UI 改动后跑 targeted tests，再跑 `typecheck` 和 `lint`。
- 不能把 AGM 做回旧 FMG 编辑器。
- 用户非常重视视觉审美、控件密度、配色一致、图标大小、交互细节和画布稳定性。

## 产品定位

AGM V1 是“自研产品 UI V1”，不是“自研地图引擎 V1”。

当前产品边界：

- 项目中心负责创建、进入、加载项目。
- 主工作台是地图优先的生产界面。
- 旧 `public/main.js` 和部分 FMG 数据结构仍作为兼容运行时存在。
- Native Studio UI 主路径不能主动打开旧 jQuery dialog。
- 旧 `public/modules/ui/*` 只作为兼容 fallback，不是当前主体验。
- 不要把所有 `window.*` 都判定为旧代码；部分是当前引擎兼容边界。

相关文档：

- `docs/AGM_SELF_OWNED_V1.md`
- `docs/AGM_V1_LEGACY_SHELL_BOUNDARY.md`
- `docs/TECH_DEBT.md`
- `docs/ENGINE_RUNTIME_WINDOW_DEPENDENCIES.md`

## 当前 UI 方向

当前主方向是 v8 产品工作台实验层，结构参考用户给出的深色专业地图编辑器设计：

- 顶部栏：品牌、画布比例/填充等视口控件、检查、导出、保存、生成、项目中心、主题、语言。
- 左侧 iconbar：保留核心模块入口。国家保留第一位；文化、省份、城镇、外交已经从左侧 iconbar 移出，改由右侧信息栏分类切换承载。
- 中央：地图画布必须保持比例、居中、滚轮缩放可用，不能点击画布导致莫名缩放/位移。
- 右侧信息栏：替代旧浮动编辑框。国家、文化、省份、城镇、外交合并为一个分类式信息栏；宗教、路线、生物群系、标记、区域等单模块信息栏不显示这组分类 tab。
- 底部栏：图层卡片和生成/健康状态。图层卡片不显示数字，开关用眼睛 icon 表达。

## 当前关键设计规则

- 不要堆卡片套卡片。
- 不要为了“重构 icon”只是给图标加框。
- 不要使用粗重边框、发光阴影、重复装饰 icon。
- 信息栏要密度高、清楚、像专业工具，不像营销页面。
- 搜索框和筛选框要统一大小、边框、背景、hover/focus，不允许文案被压成一个字。
- 编辑信息项尽量一行放两个，避免纵向过长。
- 只读信息应该是轻量概览，不要做成粗重表格。
- Apply / Reset 固定在信息栏底部，不随表单滚动。
- 覆盖信息、技术信息、只读信息默认展开，不保留无意义折叠。
- 不要留下没有真实功能的按钮、装饰 icon、重复入口。

## 当前最新 UI 状态

### v8 Shell

当前 v8 shell 已经在 `nativeShell.ts` 和 `experimentalV8.ts` 中形成主结构：

- 顶部栏动作顺序已经调整为检查、导出、保存、生成。
- 顶部栏移除了生成档案、Seed 的重复显示。
- 左侧 iconbar 底部的导出/修复入口已移到顶部栏附近。
- 底部图层卡片已改为眼睛 icon 状态，不再显示层序数字。
- 左侧工具栏和右侧信息栏边界与底部栏做过多轮对齐。

关键文件：

- `src/studio/layout/nativeShell.ts`
- `src/studio/app/styleModules/experimentalV8.ts`
- `src/studio/layout/nativeShell.test.ts`
- `src/studio/app/styles.test.ts`

### 右侧信息栏

国家、文化、省份、城镇、外交被合并为右侧信息栏顶部分类 tab，而不是分散成多个独立编辑器入口。

当前状态：

- 分类 tab 样式改成接近参考图的横向卡片/标签结构。
- 不显示数字和英文副标题。
- 搜索和筛选位于分类 tab 下方。
- 国家、文化、省份、城镇、外交使用同一套搜索/筛选布局。
- 筛选按钮已修复过被压成“筛”的问题。
- 国家只读四字段概览正在被压扁为紧凑概览带，避免占据太多纵向空间。

关键文件：

- `src/studio/layout/directStatesWorkbench.ts`
- `src/studio/layout/directStatesWorkbenchDetail.ts`
- `src/studio/layout/directStatesWorkbenchDetailContent.ts`
- `src/studio/layout/directStatesWorkbenchDetailActions.ts`
- `src/studio/layout/directWorkbenchToolbar.ts`
- `src/studio/layout/directSocietyWorkbenchView.ts`
- `src/studio/layout/directBurgsWorkbench.ts`
- `src/studio/layout/directProvincesWorkbench.ts`
- `src/studio/layout/directDiplomacyWorkbench.ts`

### 单模块信息栏

宗教、路线、生物群系、标记、区域等模块不应该显示“国家 / 文化 / 省份 / 城镇 / 外交”的分类 tab，因为它们不是同一组实体编辑。

关键文件：

- `src/studio/layout/directReligionsWorkbench.ts`
- `src/studio/layout/directRoutesWorkbench.ts`
- `src/studio/layout/directBiomesWorkbench.ts`
- `src/studio/layout/directMarkersWorkbench.ts`
- `src/studio/layout/directZonesWorkbench.ts`
- `src/studio/layout/nativeModuleContractWorkbench.ts`

### 生物群系

生物群系已经从浮动 popover 逐步收进右侧信息栏：

- 不再重复显示“画布 / 图层 / 关系”等顶部摘要。
- 生物群系分布图和目标占比滑杆保留。
- 独立浮动生物群系弹窗已经被移除或不应在主路径重复出现。
- 颜色和框体还在逐步贴合 v8 信息栏风格，避免框太多。

关键文件：

- `src/studio/layout/biomeInsightsPanel.ts`
- `src/studio/layout/directBiomesWorkbench.ts`
- `src/studio/layout/nativeBiomeAdjustmentPanel.test.ts`
- `src/studio/app/canvasPaintEditing.ts`

### Canvas / Workbench 行为

已经反复修过的行为边界：

- 鼠标滚轮缩放画布保留。
- 鼠标点击画布不应该触发莫名缩放或位移。
- 首次进入编辑页，鼠标移到画布时默认是拖动画布状态。
- 选择地图状态不使用十字光标，使用手指/选择语义更明确的指针。
- 打开编辑框/信息栏后，点击非编辑区域应该关闭当前编辑框；但顶部栏、iconbar 等工具点击不应误关。
- 画布容器必须保持比例并居中，不能硬铺满导致左边出现异常空条。

关键文件：

- `src/studio/app/canvasController.ts`
- `src/studio/app/canvasInteractionTargets.ts`
- `src/studio/layout/canvasToolHud.ts`
- `src/studio/layout/nativeShell.ts`
- `tests/e2e/studio-v1-acceptance.spec.ts`
- `tests/e2e/studio-v1-editor-convergence.spec.ts`

## 当前 V1 状态

`docs/AGM_SELF_OWNED_V1.md` 记录 V1 已经按“自研产品 UI V1”收敛到 100%。

这里的 100% 指：

- 主流程不再以旧 FMG UI 为中心。
- Project Center -> Workbench -> 编辑核心实体 -> 图层/生物群系调整 -> 关系修复/导出 readiness 有闭环。
- 旧 jQuery UI 和旧兼容套件清理属于 post-V1，不再定义 V1 完成度。

不要把 post-V1 债务误判成 V1 未完成。

## 当前技术债边界

主要债务：

- `experimentalV8.ts` 选择器很多，后续需要 CSS 分层。
- `nativeShell.ts` 和旧 theme override 仍有较多样式兼容。
- 旧 `public/modules/ui/*` jQuery dialog 没有全部替换。
- `public/main.js` 仍是算法/运行时兼容边界的一部分。
- 部分测试仍覆盖旧 shell/旧兼容路径，不应让它们反向定义产品 UI。

详见：

- `docs/TECH_DEBT.md`
- `docs/AGM_V1_LEGACY_SHELL_BOUNDARY.md`

## 最近验证过的命令

针对最近右侧信息栏、搜索/筛选、国家概览卡片等改动，已跑过：

```powershell
npm.cmd run test -- --run src/studio/app/styles.test.ts src/studio/layout/directStatesWorkbench.test.ts
npm.cmd run typecheck
npm.cmd run lint
```

此前多模块 targeted suites 也反复跑过：

```powershell
npm.cmd run test -- --run src/studio/app/styles.test.ts src/studio/layout/directWorkbenchToolbar.test.ts src/studio/layout/directStatesWorkbench.test.ts src/studio/layout/directIdentityWorkbenches.test.ts src/studio/layout/directPlaceWorkbenches.test.ts src/studio/layout/directDiplomacyWorkbench.test.ts src/studio/layout/directBiomesWorkbench.test.ts src/studio/layout/directRoutesWorkbench.test.ts src/studio/layout/directMarkersWorkbench.test.ts src/studio/layout/directZonesWorkbench.test.ts src/studio/layout/nativeModuleContractWorkbench.test.ts
npm.cmd run typecheck
npm.cmd run lint
```

常用完整检查：

```powershell
npm.cmd run build
npm.cmd run test:e2e:studio
```

## 新对话接手提示

可以把下面这段发给新对话。它只建立上下文，不指定具体任务：

```text
我们继续做 AGM Studio，工作目录是 D:\AGM\AGM-Studio。请先读 docs/AGM_UI_HANDOFF_2026-05-07.md。

AGM Studio 正在重建为自研地图产品 UI，不是重皮肤版 FMG 编辑器。当前本地地址是 http://127.0.0.1:5174/AGM-Studio/。

请中文回复。不要回滚无关 dirty worktree。搜索用 rg，手工编辑用 apply_patch。改完用 targeted tests、typecheck、lint 验证。正式代码只改 D:\AGM\AGM-Studio，不要碰 D:\UIAGM，除非我明确要求。
```
