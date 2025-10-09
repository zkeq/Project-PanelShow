# Project 项目信息结构体提示词说明

本文档用于指导 AI 生成可直接提交到「新建/编辑作品集」页面的项目数据（对应 `CreateProjectForm` 的 `ProjectFormData` 结构）。请严格按照字段约束与枚举说明组织提示词内容，确保生成的数据可以无缝写入仓库。所有字段除特别说明外均为可选，但缺失核心字段会导致表单校验失败。

## 顶层字段 (`ProjectFormData`)
- `id` *(string)*：项目唯一标识。推荐使用 UUID 或基于名称的 slug。
- `name` *(string, 必填)*：项目名称，建议 2~20 字。
- `description` *(string, 必填)*：项目一句话简介，用于卡片与详情页摘要。
- `tags` *(string[])*：项目标签列表，建议 0~6 项，内容需为简短词语。
- `status` *(ProjectStatus \| null)*：项目状态对象，详见下文。若提供该对象需同步填写 `statusId`。
- `statusId` *(string \| null)*：提交给后端的状态 ID。常用枚举：
  - `active`（活跃项目）
  - `building`（施工中）
  - `iterated`（已迭代）
  - `archived`（已归档）
  可根据设置中心新增自定义 ID。
- `type` *(ProjectType \| null)*：项目类型对象，详见下文。若提供需同步填写 `typeId`。
- `typeId` *(string \| null)*：项目类型 ID。默认枚举：`company`、`personal`、`startup`，亦可使用自定义 slug。
- `features` *(ProjectFeature[])*：用于首页徽章的项目特色标签。每项需至少包含 `id`、`label`、`icon`，并可指定 `appearance` 预设。
- `previewUrl` *(string)*：PC 端在线预览地址，需为完整 URL。
- `mobilePreviewUrl` *(string)*：移动端预览地址，选填。
- `sourceUrl` *(string)*：源码仓库地址。若 `isOpenSource` 为 `true` 则必填。
- `leftSidebarMarkdown` / `rightSidebarMarkdown` *(string)*：项目详情页左右侧附加信息的 Markdown 文本。
- `isOpenSource` *(boolean)*：是否开源。为 `true` 时必须提供 `sourceUrl`。
- `readme` *(string)*：自定义 README Markdown 内容。
- `screenshots` *(Screenshot[])*：项目截图集合，详见下文。
- `projectInfos` *(ProjectInfo[])*：信息项配置，用于首页卡片、侧栏与 Hero 区展示。
- `projectIntroduction` *(string)*：长描述 Markdown。提交时会映射到 `longDescription`。
- `featureHighlights` *(FeatureHighlight[])*：项目亮点/演示配置，详见下文。
- `createdAt` / `updatedAt` *(ISO 8601 字符串，可选)*：创建与更新时间，不提供时前端会自动生成。
- `longDescription` *(string, 可选)*：若已提供 `projectIntroduction` 可保持为空，由表单写入。

## 嵌套结构说明

### ProjectStatus
- `id` *(string)*：状态 ID，应与 `statusId` 保持一致。
- `label` *(string)*：展示名称，例如「施工中」。
- `color` *(string)*：Tailwind 背景色类名，例如 `bg-green-500`。

### ProjectType
- `id` *(string)*：类型 ID，应与 `typeId` 一致。
- `label` *(string)*：展示名称，例如「个人项目」。
- `icon` *(string)*：`lucide-react` 图标名称（不含前缀），如 `Rocket`、`Building2`。

### ProjectFeature（首页徽章）
- `id` *(string)*：唯一标识，建议使用 slug。
- `label` *(string)*：徽章标题。
- `icon` *(string)*：`lucide-react` 图标名称，例如 `Sparkles`。
- `appearance` *(object 可选)*：
  - `presetId`：特效预设，枚举值：`golden-glow`、`forest-breeze`、`skyline`、`violet-dream`、`rose-quartz`、`midnight`、`aurora`、`citrus-spark`、`lavender-mist`、`ember`、`azure-wave`、`slate-focus`。
  - 可额外提供 `containerClassName`、`iconClassName` 等自定义类名。
- `color` *(string，可选)*：兼容旧数据的颜色类，当前前端优先使用 `appearance`。

### Screenshot
- `id` *(string)*：截图唯一 ID。
- `name` *(string)*：文件名或展示名称。
- `description` *(string)*：图片说明。
- `url` *(string)*：截图访问地址，需为完整 URL 或可用静态路径。

### ProjectInfo（信息项）
- `id` *(string)*：唯一标识。
- `icon` *(string)*：`iconify` 图标名称，例如 `lucide:rocket`。
- `label` *(string)*：展示标题，如「技术栈」。
- `valueCode` *(string)*：用于运行时生成展示值的表达式，可返回字符串或数值。
- `value` *(string，可选)*：当 `valueCode` 为空或执行失败时使用的兜底文本。
- `showInHomepage` / `showInSidebar` *(boolean)*：是否在首页卡片、项目侧栏展示。
- `showInHero` *(boolean，可选)*：是否在详情页 Hero 区展示。
- `color` *(string)*：Tailwind 类组合，控制文本/背景/边框颜色，例如 `text-blue-600 bg-blue-50 border-blue-200`。
- `order` *(number)*：排序权重，值越小越靠前。

### FeatureHighlight（项目亮点/演示）
- `id` *(string)*：唯一标识，常用 `feature-${slug}` 格式。
- `title` *(string)*：亮点标题。
- `description` *(string)*：亮点详情，可为多行文本。
- `techStack` *(ColorfulTag[])*：技术标签，元素结构：
  - `id` *(string)*：标签 ID。
  - `name` *(string)*：标签名称。
  - `color` / `bgColor` / `textColor` / `borderColor` *(string)*：Tailwind 渐变或颜色类，用于自定义样式。
- `screenshots` *(Screenshot[])*：与上文一致的截图结构。
- `previewUrl` *(string)*：该亮点的桌面演示地址。
- `mobilePreviewUrl` *(string, 可选)*：移动端演示地址。
- `leftMarkdown` / `rightMarkdown` *(string)*：亮点详情页左右栏 Markdown 文本。

## 生成提示词建议
1. 明确告知 AI：必须生成完整的 JSON/对象结构，字段名与上述说明完全一致。
2. 对必填字段（`name`、`description`、`statusId`、`typeId`、`projectInfos` 等）给出具体的长度、语气和语言要求，例如「保持中文描述」「控制在 60 字以内」。
3. 若需要 `valueCode` 计算值，请描述其逻辑来源，例如 `return '50w'` 或基于已有属性拼接。
4. URL 字段须提供合法可替换的占位符（如 `https://example.com/demo`），截图可使用可访问的静态路径或自定义上传地址。
5. 颜色类需使用 Tailwind 语法（如 `bg-blue-50`、`from-sky-500 to-indigo-600`），避免使用十六进制。
6. 如果项目包含开源要求，请提醒 AI 在 `isOpenSource=true` 时同步生成有效的 `sourceUrl`。

按照上述结构撰写提示词，可确保自动化生成的项目数据符合前端与后端的字段约束，并能直接用于项目创建与展示。
