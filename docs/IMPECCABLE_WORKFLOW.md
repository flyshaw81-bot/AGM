# AGM Studio × Impeccable 完整工作流指令

> 适用对象：接入 Impeccable skill 的 AI 编程助手（Claude Code / Cursor / Codex CLI）
> 版本：1.0 / 2026-05-08
> 前置条件：已安装 [Impeccable](https://github.com/pbakaus/impeccable) skill

---

## ⚠️ 核心规则（每次必读）

1. **保持所有 `data-studio-action` / `data-value` / `data-studio-*` 属性不变** — 事件委托依赖它们
2. **保持渲染入口签名不变** — `(root: HTMLElement, state: StudioState) => void`
3. **CSS 注入方式不变** — TypeScript 字符串常量 → `<style id="studioShellStyles">`
4. **不动 HTML 结构** — 只改 CSS token 值、选择器声明、字体/间距/颜色/动效
5. **每步改完跑测试** — `npx vitest run`

---

## 第一步：建立设计上下文（只做一次）

```
/impeccable teach

## 项目身份
AGM Studio — 程序化世界地图生成编辑器，面向游戏开发团队（关卡设计师、世界构建者）。
不是 SaaS 后台，不是 Landing Page，是专业创作工具。

## 技术栈
- TypeScript + CSS-in-JS（模板字符串注入单个 <style id="studioShellStyles"> 标签）
- 无 React/Vue/框架 — 纯 DOM 操作
- 渲染入口：src/studio/app/studioRenderer.ts → root.innerHTML = renderShell(state)
- 事件系统：document 委托 click，通过 data-studio-action 属性路由

## 关键文件
- 核心 Shell：src/studio/layout/nativeShell.ts（1183行）
- 样式系统：src/studio/app/styleModules/
  - foundationEnvironment.ts — 全局变量、字体、基础重置
  - foundationControls.ts — 按钮、输入框、交互控件
  - themeSystemBase.ts — daylight/night 主题变量
  - themeSystemGuardrails.ts — 主题覆盖和约束
  - workspaceLayoutStage.ts — 画布、舞台区布局
  - directWorkbenchBase.ts — 工作台基础样式
- CSS 注入入口：src/studio/app/styles.ts
- 状态类型：src/studio/types/index.ts

## 当前设计问题（已知）
1. 98 个 !important 用在 nativeShell.ts，特异性战争失控
2. 208 个硬编码 hex 颜色值，切换主题时不生效
3. 间距随机（12px/14px/16px 混用），无统一 scale
4. 字体层级扁平 — 全用系统默认，无标题/正文/标签区分
5. 动效时间分散（120ms/140ms/160ms/180ms 混用），无 token
6. 暗色主题配色偏沉闷（#0A0A0A 底 + 单一紫色 accent），缺少层次
7. 无 prefers-reduced-motion 全局覆盖
8. 无全局 :focus-visible 规则

## 设计偏好
- 现代专业工具风格（Linear / Raycast 参考，不变消费级 SaaS）
- 暗色主题为主（用户群体偏好），浅色为辅
- 紫色系 accent（当前 #a78bfa 方向保持）
- 克制动效 — 功能导向，不要花哨
- 高对比度可读性优先
```

---

## 第二步：审查现有设计

```
/impeccable critique

审视 AGM Studio 整套界面。从以下几个方面逐一点评，每个给出具体问题+改进方向：

1. 视觉层级：Topbar / IconRail / CanvasStage / Drawer / LayerBar 之间主次分明吗？
2. 可交互元素 vs 静态展示：按钮/选中态/悬停态是否足够明显？
3. 色彩：暗色主题的层次感够不够？accent 色用得是否克制？
4. 间距节奏：有没有呼吸感？还是挤在一起？
5. 字体：不同信息层级有明确区分吗？

重点文件：src/studio/layout/nativeShell.ts 和 src/studio/app/styleModules/themeSystemGuardrails.ts
```

---

## 第三步：分维度逐一改进

### 3.1 字体层级

```
/impeccable typeset

只改字体相关，不动颜色、不动布局、不动间距。

文件范围：src/studio/app/styleModules/foundationEnvironment.ts

具体要求：
1. 建立三级字体体系：
   - 标题级（Topbar 标题、面板标题）→ font-weight: 600, font-size: 15px, letter-spacing: -0.01em
   - 正文级（列表项、字段标签）→ font-weight: 400, font-size: 13px
   - 辅助级（计数、时间戳、说明文字）→ font-weight: 400, font-size: 11px, opacity: 0.65
2. 用 --agm-font-ui 变量统一引用
3. 中文字体栈：system-ui, "PingFang SC", "Microsoft YaHei", sans-serif
4. 等宽字体（代码/数字）："JetBrains Mono", "Cascadia Code", monospace
5. 不改任何 HTML 结构
6. 改完跑：npx vitest run
```

### 3.2 配色体系

```
/impeccable colorize

重做整个色彩体系。只改 CSS 自定义属性值，不动选择器、不动结构。

文件范围：
- src/studio/app/styleModules/themeSystemBase.ts（基础 token 定义）
- src/studio/app/styleModules/themeSystemGuardrails.ts（覆盖和约束）

具体要求：
1. Night 主题：
   - bg: #09090B（比现在的 #0A0A0A 略深一点，增加层次空间）
   - surface: #141418（卡片/面板底色）
   - surface-hover: #1C1C22（悬停）
   - border: #2A2A35（比现在更柔和）
   - text: #FAFAFA（主文字）
   - text-secondary: #A1A1AA（次要）
   - accent: #A78BFA（保持紫色方向）
   - accent-2: #60A5FA（蓝，辅助accent）
   - accent-3: #22D3EE（青，三级accent）
   - success: #34D399 / warning: #FBBF24 / danger: #F87171

2. Daylight 主题：
   - bg: #F8F7F4
   - surface: #FFFFFF
   - border: #E5E3DE
   - text: #18181B
   - accent: #7C3AED

3. 统一 token 命名 — 全部改为 --studio-* 前缀，消除 --pencil-* / --agm-* / --studio-native-* 混用
4. 每个 token 在两个主题下都要定义
5. 改完跑：npx vitest run
```

### 3.3 间距与布局节奏

```
/impeccable layout

只改间距/圆角/阴影，不动颜色、不动字体。

文件范围：
- src/studio/app/styleModules/foundationControls.ts
- src/studio/layout/nativeShell.ts（选择器声明部分）
- src/studio/app/styleModules/workspaceLayoutStage.ts

具体要求：
1. 建立统一 spacing scale，在 foundationEnvironment.ts 顶部定义：
   --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
   --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px

2. 建立统一 radius scale：
   --radius-xs: 6px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px; --radius-pill: 999px

3. 替换各处硬编码 padding/margin：
   - Topbar: padding → 0 var(--space-5)
   - IconRail 内项: padding → var(--space-3) var(--space-4)
   - Drawer: padding → var(--space-5)
   - 按钮: padding → var(--space-2) var(--space-4)，radius → var(--radius-pill)
   - 卡片: padding → var(--space-4)，radius → var(--radius-lg)

4. 层级之间间距：
   - Topbar ↔ 主区域：无额外间距（border-bottom 分隔）
   - IconRail ↔ CanvasStage：0
   - CanvasStage ↔ Drawer：0
   - 主区域 ↔ Statusbar：0

5. 消除所有裸 14px / 12px / 6px padding 值，改用 --space-* token
6. 改完跑：npx vitest run
```

### 3.4 动效

```
/impeccable animate

只加动效，不动颜色、不动字体、不动布局。

文件范围：src/studio/app/styleModules/foundationControls.ts

具体要求：
1. 在 foundationEnvironment.ts 顶部建立 motion token：
   --motion-fast: 120ms; --motion-base: 180ms; --motion-slow: 260ms;
   --ease-standard: cubic-bezier(0.2, 0, 0, 1);
   --ease-emphasized: cubic-bezier(0.05, 0.7, 0.1, 1);

2. 各交互元素动效：
   - 按钮 hover：transform scale(1.02)，transition var(--motion-fast) var(--ease-standard)
   - 按钮 active：transform scale(0.98)
   - 列表项 hover：background-color 变化，var(--motion-fast)
   - Drawer 开闭：translateX + opacity，var(--motion-slow) var(--ease-emphasized)
   - Toast 出现：translateY(-4px) + opacity 0→1, var(--motion-base)
   - Toast 消失：opacity 1→0, var(--motion-fast)
   - 加载指示器：持续旋转 spin 动画，1s linear infinite

3. 全局 reduced-motion 覆盖（在 foundationEnvironment.ts 末尾）：
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }

4. 不做 scroll-trigger、parallax、magnetic 等重动效
5. 改完跑：npx vitest run
```

### 3.5 基础组件视觉强化

```
/impeccable bolder

强化基础交互控件的视觉表现，不改结构。

文件范围：
- src/studio/app/styleModules/foundationControls.ts
- src/studio/layout/nativeShell.ts

具体要求：
1. 按钮：
   - Primary 按钮：gradient accent 背景 → 增加 box-shadow: 0 1px 2px rgba(167,139,250,0.25)
   - Ghost 按钮：hover 时 background 从透明 → rgba(167,139,250,0.1)
   - Danger 按钮：保持红色，hover 加深

2. 选中态（IconRail 当前项）：
   - 左侧 accent 条 → 3px 宽，当前 2px
   - 背景 → rgba(167,139,250,0.12)
   - 图标和文字 → accent 色

3. 输入框/搜索栏：
   - focus 时 border-color → accent
   - focus 时 box-shadow → 0 0 0 3px rgba(167,139,250,0.15)

4. 滚动条（Webkit）：
   - 宽度 6px
   - thumb → rgba(255,255,255,0.12)，hover → rgba(255,255,255,0.2)
   - track → transparent

5. 改完跑：npx vitest run
```

### 3.6 无障碍补全

```
/impeccable audit

只做无障碍检查+修复，不动视觉设计。

文件范围：src/studio/app/styleModules/foundationEnvironment.ts

具体要求：
1. 添加全局 :focus-visible 规则：
   :focus-visible {
     outline: 2px solid var(--studio-accent);
     outline-offset: 3px;
     border-radius: 2px;
   }

2. 检查现有 Tab 键顺序是否合理（Topbar → IconRail → Canvas → Drawer → Statusbar）

3. 确保所有 icon-only 按钮有 aria-label

4. 确认暗色主题下文字对比度 ≥ 4.5:1（正常文字）/ 3:1（大文字）

5. 改完跑：npx vitest run && npx playwright test tests/e2e/
```

---

## 第四步：最终收敛

```
/impeccable polish

检查以上所有改动的整体一致性：

1. 暗色和亮色两个主题都正常渲染吗？
2. 有无遗漏的硬编码颜色值（grep 裸 hex）？
3. 所有 token 是否统一到 --studio-* 命名？消除 --pencil-* / --agm-* 了吗？
4. 动效时间是否全部引用 --motion-* token？
5. 间距是否全部引用 --space-* token？
6. 有无新增的 !important？
7. 有无破坏 data-studio-action 事件委托？
8. 224 个测试文件全部通过了吗？

发现问题 → 修复 → 再跑 polish 再检查
```

---

## 附录：快速验证命令

```bash
# 跑所有单元测试
npx vitest run

# 跑 E2E
npx playwright test tests/e2e/

# 启动开发服务器目视检查
npx vite --port 5174

# 检查是否还有裸 hex 颜色（排除已有 token 定义文件）
rg -l '#[0-9a-fA-F]{6}' src/studio/app/styleModules/ --files-without-match 'var\(--'

# 检查是否还有 --pencil 前缀残留
rg '\-\-pencil' src/studio/
```

---

## 如果某一步改完看不出效果

说明这一项本质不差，跳过。不要为了改而改。

以下是**视觉差异最大的优先级**：
1. `/colorize` — 配色一改变化最大
2. `/typeset` — 字体层级立竿见影
3. `/bolder` — 按钮/选中态强化
4. `/layout` — 间距统一
5. `/animate` — 动效锦上添花
