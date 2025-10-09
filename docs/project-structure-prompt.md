# Project 项目信息结构体提示词说明

本文档用于为 AI 生成 Project-PanelShow 项目信息时提供统一的字段说明与取值约束，可直接复制为提示词使用。

## 顶层 `Project` 结构
- `id`：项目唯一标识，使用短横线或驼峰的英文字符串。
- `name`：项目名称，建议控制在 2~12 个字符内。
- `description`：一句话简介，突出项目亮点或价值，60 字以内。
- `status`：项目当前状态，枚举值：
  - `"active"`：持续迭代中的核心项目。
  - `"maintained"`：进入维护期，主要处理缺陷和小幅更新。
  - `"completed"`：已完成的历史项目，仅做展示。
  - `"building"`：正在建设或规划阶段的项目。
- `category`：自定义分类标签，例如 "Web"、"AI"、"Tools"。
- `techStacks`：技术栈标签数组，按先后重要程度排序。
- `previewImage`：项目主视觉图 URL，需为可访问的网络地址。
- `updatedAt`：最后更新时间，ISO 8601 字符串。
- `attributes`：可自定义属性列表，详见下文 `ProjectAttribute`。
- `projectInfos`：项目信息项原始列表，详见 `ProjectInfo`。
- `homeAttributes` / `sidebarAttributes` / `heroAttributes`：用于首页、侧边栏、详情页 Hero 区的精选信息集合，元素同样遵循 `ProjectInfo` 结构。
- `screenshots`：项目截图数组，元素包含 `id`、`url`、`alt` 描述。
- `themeColor`：卡片主题色配置，包含 `primary`、`secondary`、`background`、`text`、`border` 五个 16 进制颜色值。

## `ProjectAttribute` 自定义属性
- `key`：英文唯一键，例如 `deployTime`。
- `label`：展示名称，例如 "部署用时"。
- `value`：静态展示值，字符串。
- `icon`：可选的图标标识，使用 `iconify` 图标名。

## `ProjectInfo` 信息项
- `id`：唯一标识。
- `icon`：`iconify` 图标名称，例如 `lucide:rocket`。
- `label`：字段名称，例如 "技术栈"。
- `valueCode`：用于实时计算展示值的 JavaScript 表达式字符串。可读取上下文中的变量，返回字符串。
- `value`：可选的静态兜底值，当 `valueCode` 不存在或执行失败时使用。
- `showInHomepage` / `showInSidebar` / `showInHero`：布尔值，控制信息出现的位置。
- `color`：前景色（16 进制）。
- `order`：排序权重，数值越小越靠前。

## `DisplayDataItem`（详情页自定义展示）
- `key`：唯一键。
- `label`：展示名称。
- `value`：展示内容。
- `icon`：可选 `iconify` 图标名称。
- `color` / `bgColor` / `textColor` / `borderColor`：可选色彩定制。
- `type`：展示类型，枚举值：
  - `"text"`：普通文本。
  - `"badge"`：徽章展示。
  - `"progress"`：进度条。
  - `"link"`：可点击链接。

## `ProjectDetail` 详情结构
- `id` / `name` / `description`：与 `Project` 对应。
- `status`：同上。
- `previewImage`：详情主图。
- `previewUrl`：在线预览链接。
- `longDescription`：详细描述，可多段文本。
- `displayData`：数组，成员为 `DisplayDataItem`。
- `images`：图文介绍数组，每项包含 `src`、`alt`、`label`、`description`。
- `features`：功能亮点列表，每项包含：
  - `title`、`description`、`icon`。
  - `techStack`：技术标签数组，元素含 `name`、`color`、`bgColor`、`textColor`、`borderColor`。
  - `images`：与上文结构一致的配图列表。
- `timeline`：项目里程碑对象，以年份和月份组织，叶子节点数组包含：
  - `title`：事件标题。
  - `date`：日期字符串。
  - `status`：枚举值 `"completed"`（已完成）、`"in_progress"`（进行中）、`"planned"`（计划中）。
- `themeColor`：与 `Project` 相同的主题色对象。

## 提示词编写建议
1. 先告知 AI 输出必须符合上述字段与枚举限制。
2. 明确每个字段的语言风格，例如描述使用中文、技术栈使用英文缩写。
3. 如果需要 `valueCode`，请描述其业务逻辑，例如基于 `attributes` 计算。
4. 对截图、配图和链接字段，要求 AI 使用占位符或可替换的示例 URL。
5. 强调颜色值使用 `#RRGGBB` 格式，避免透明度。

使用本说明，可快速生成满足前端与后端约束的项目信息 JSON。
