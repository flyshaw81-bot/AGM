# AGM Studio - Claude 工作记忆

## CSS Grid 布局经验 (2026-05-11)

**教训**: 当组件 A（如信息栏）需要在视觉上横跨组件 B（如 footer）的部分列区域时，不要死磕 B 的内部子 grid 布局。应该把 B 的各个部分拆开，放到父级 grid 的不同 row 上，让 A 和 B 的不同子部分在父级 grid 层级共存。

**具体案例**: v8 UI 底部栏。footer 内部用子 grid 分卡片行和状态行，状态栏需要横跨 footer 的三列（`grid-column: 1 / -1`），导致 column 3 的 row 1 永远是空的，显示为一条视觉 bar。

**错误做法**: 反复调 footer 的 column 数、调 `grid-column`、加伪元素填充空位、让 main 跨行覆盖 footer。这些都在 footer 内部打转。

**正确做法**: 把 workbench 改成 3 行（地图、卡片、状态栏），卡片和状态栏各占一个独立 row，不再嵌套在 footer 子 grid 内。这样 info panel 可以直接跨到卡片行，不存在空列问题。

**关键文件**:
- `src/studio/app/styleModules/experimentalV8.ts` — v8 UI 所有 CSS
- `src/studio/layout/nativeShell.ts` — HTML 模板
