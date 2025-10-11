export const PROJECT_JSON_PROMPT_GUIDE = `Project 项目信息结构体提示词说明
本文档用于指导 AI 生成可直接提交到「新建/编辑作品集」页面的项目数据（对应 CreateProjectForm 的 ProjectFormData 结构）。请严格按照字段约束与枚举说明组织提示词内容，确保生成的数据可以无缝写入仓库。所有字段除特别说明外均为可选，但缺失核心字段会导致表单校验失败。

顶层字段 (ProjectFormData)
id (string)：项目唯一标识。推荐使用 UUID 或基于名称的 slug。
name (string, 必填)：项目名称，建议 2~20 字。
description (string, 必填)：项目一句话简介，用于卡片与详情页摘要。
tags (string[])：项目标签列表，建议 0~6 项，内容需为简短词语。
status (ProjectStatus | null)：项目状态对象，详见下文。若提供该对象需同步填写 statusId。
statusId (string | null)：提交给后端的状态 ID。常用枚举：
  active（活跃项目）
  building（施工中）
  iterated（已迭代）
  archived（已归档）
  可根据设置中心新增自定义 ID。
type (ProjectType | null)：项目类型对象，详见下文。若提供需同步填写 typeId。
typeId (string | null)：项目类型 ID。默认枚举：company、personal、startup，亦可使用自定义 slug。
features (ProjectFeature[])：用于首页徽章的项目特色标签。每项需至少包含 id、label、icon，并可指定 appearance 预设。
previewUrl (string)：PC 端在线预览地址，需为完整 URL。
mobilePreviewUrl (string)：移动端预览地址，选填。
sourceUrl (string)：源码仓库地址。若 isOpenSource 为 true 则必填。
leftSidebarMarkdown / rightSidebarMarkdown (string)：项目详情页左右侧附加信息的 Markdown 文本。
isOpenSource (boolean)：是否开源。为 true 时必须提供 sourceUrl。
readme (string)：自定义 README Markdown 内容。
screenshots (Screenshot[])：项目截图集合，详见下文。
projectInfos (ProjectInfo[])：信息项配置，用于首页卡片、侧栏与 Hero 区展示。
projectIntroduction (string)：长描述 Markdown。提交时会映射到 longDescription。
featureHighlights (FeatureHighlight[])：项目亮点/演示配置，详见下文。
createdAt / updatedAt (ISO 8601 字符串，可选)：创建与更新时间，不提供时前端会自动生成。
longDescription (string, 可选)：若已提供 projectIntroduction 可保持为空，由表单写入。

嵌套结构说明
ProjectStatus
id (string)：状态 ID，应与 statusId 保持一致。
label (string)：展示名称，例如「施工中」。
color (string)：Tailwind 背景色类名，例如 bg-green-500。

ProjectType
id (string)：类型 ID，应与 typeId 一致。
label (string)：展示名称，例如「个人项目」。
icon (string)：lucide-react 图标名称（不含前缀），如 Rocket、Building2。

ProjectFeature（首页徽章）
id (string)：唯一标识，建议使用 slug。
label (string)：徽章标题。
icon (string)：lucide-react 图标名称，例如 Sparkles。
appearance (object 可选)：
  presetId：特效预设，枚举值：golden-glow、forest-breeze、skyline、violet-dream、rose-quartz、midnight、aurora、citrus-spark、lavender-mist、ember、azure-wave、slate-focus。
  可额外提供 containerClassName、iconClassName 等自定义类名。
color (string，可选)：兼容旧数据的颜色类，当前前端优先使用 appearance。

Screenshot
id (string)：截图唯一 ID。
name (string)：文件名或展示名称。
description (string)：图片说明。
url (string)：截图访问地址，需为完整 URL 或可用静态路径。

ProjectInfo（信息项）
id (string)：唯一标识。
icon (string)：iconify 图标名称，例如 lucide:rocket。
label (string)：展示标题，如「技术栈」。
valueCode (string)：用于运行时生成展示值的表达式，可返回字符串或数值。
value (string，可选)：当 valueCode 为空或执行失败时使用的兜底文本。
showInHomepage / showInSidebar (boolean)：是否在首页卡片、项目侧栏展示。
showInHero (boolean，可选)：是否在详情页 Hero 区展示。
color (string)：Tailwind 类组合，控制文本/背景/边框颜色，例如 text-blue-600 bg-blue-50 border-blue-200。
order (number)：排序权重，值越小越靠前。

FeatureHighlight（项目亮点/演示）
id (string)：唯一标识，常用 feature-\${slug} 格式。
title (string)：亮点标题。
description (string)：亮点详情，可为多行文本。
techStack (ColorfulTag[])：技术标签，元素结构：
  id (string)：标签 ID。
  name (string)：标签名称。
  color / bgColor / textColor / borderColor (string)：Tailwind 渐变或颜色类，用于自定义样式。
screenshots (Screenshot[])：与上文一致的截图结构。
previewUrl (string)：该亮点的桌面演示地址。
mobilePreviewUrl (string, 可选)：移动端演示地址。
leftMarkdown / rightMarkdown (string)：亮点详情页左右栏 Markdown 文本。

生成提示词建议
明确告知 AI：必须生成完整的 JSON/对象结构，字段名与上述说明完全一致。
对必填字段（name、description、statusId、typeId、projectInfos 等）给出具体的长度、语气和语言要求，例如「保持中文描述」「控制在 60 字以内」。
若需要 valueCode 计算值，请描述其逻辑来源，例如 return '50w' 或基于已有属性拼接。
URL 字段须提供合法可替换的占位符（如 https://example.com/demo），截图可使用可访问的静态路径或自定义上传地址。
颜色类需使用 Tailwind 语法（如 bg-blue-50、from-sky-500 to-indigo-600），避免使用十六进制。
如果项目包含开源要求，请提醒 AI 在 isOpenSource=true 时同步生成有效的 sourceUrl。
按照上述结构撰写提示词，可确保自动化生成的项目数据符合前端与后端的字段约束，并能直接用于项目创建与展示。

注意以下几点
1. 编写项目概览信息的时候 每个项目编写30个 然后每个值都很短
2. 编写markdown信息的时候 尽量对这个项目进行详细的总结 简洁明了 不要废话 这个字段是 projectIntroduction
3. 然后 homeAttributes 最多4个 heroAttributes 最多3个  sidebarAttributes最多8个 "showInHomepage": true,"showInSidebar": true,"showInHero": false 在这里定义

以下示例为「SparkAI Frontend 前端项目」的完整 JSON 配置，可直接复制并按需调整字段：

{
  "id": "sparkai-frontend",
  "name": "SparkAI Frontend 前端项目",
  "description": "智能化多端面板的高性能前端实现",
  "tags": [
    "AI驱动",
    "前端工程",
    "多端体验"
  ],
  "status": {
    "id": "building",
    "label": "施工中",
    "color": "bg-yellow-500"
  },
  "statusId": "building",
  "type": {
    "id": "type-innovative-saas",
    "label": "新型项目",
    "icon": "Rocket"
  },
  "typeId": "type-innovative-saas",
  "features": [
    {
      "id": "feature-high-performance",
      "label": "高性能",
      "icon": "Sparkles",
      "appearance": {
        "presetId": "golden-glow"
      }
    },
    {
      "id": "feature-high-concurrency",
      "label": "高并发",
      "icon": "Rocket",
      "appearance": {
        "presetId": "aurora"
      }
    },
    {
      "id": "feature-visual-automation",
      "label": "可视化自动化",
      "icon": "PanelRightOpen",
      "appearance": {
        "presetId": "skyline"
      }
    }
  ],
  "previewUrl": "https://icodeq.com",
  "mobilePreviewUrl": "https://icodeq.com",
  "sourceUrl": "https://github.com/zkeq/Coding",
  "leftSidebarMarkdown": "- 支持多角色权限管理\n- 提供数据看板与实时监控\n- 集成自动化发布流程",
  "rightSidebarMarkdown": "- 联系邮箱：hi@sparkai.dev\n- 团队规模：6 人核心成员\n- 目标行业：AIGC + SaaS",
  "isOpenSource": true,
  "readme": "# SparkAI Frontend\n\n- 使用 Vue 3 + Vite 构建模块化前端\n- 集成 Next.js BFF 托管多终端视图\n- 提供管理端表单、动态配置与资产上传能力",
  "screenshots": [
    {
      "id": "ce83144a-f106-4def-8603-9c9602901886",
      "name": "coding-for-music-and-movie.png",
      "description": "工作台展示主面板",
      "url": "http://localhost:8000/uploads/zkeq/project-screenshots/8779d81912cf49ec8add18cd6f7baebe.png"
    }
  ],
  "projectInfos": [
    {
      "id": "info-00",
      "icon": "lucide:layers",
      "label": "核心框架",
      "valueCode": "return 'Vue3'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-sky-600 bg-sky-50 border-sky-200",
      "order": 0
    },
    {
      "id": "info-01",
      "icon": "lucide:bolt",
      "label": "渲染模式",
      "valueCode": "return 'SSR'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-amber-600 bg-amber-50 border-amber-200",
      "order": 1
    },
    {
      "id": "info-02",
      "icon": "lucide:rocket",
      "label": "首屏",
      "valueCode": "return '1.2s'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-indigo-600 bg-indigo-50 border-indigo-200",
      "order": 2
    },
    {
      "id": "info-03",
      "icon": "lucide:cpu",
      "label": "渲染引擎",
      "valueCode": "return 'Vite'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 3
    },
    {
      "id": "info-04",
      "icon": "lucide:cog",
      "label": "自动化",
      "valueCode": "return 'CI/CD'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-rose-600 bg-rose-50 border-rose-200",
      "order": 4
    },
    {
      "id": "info-05",
      "icon": "lucide:lock",
      "label": "权限",
      "valueCode": "return 'RBAC'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-slate-600 bg-slate-50 border-slate-200",
      "order": 5
    },
    {
      "id": "info-06",
      "icon": "lucide:database",
      "label": "数据源",
      "valueCode": "return 'REST'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-cyan-600 bg-cyan-50 border-cyan-200",
      "order": 6
    },
    {
      "id": "info-07",
      "icon": "lucide:globe",
      "label": "国际化",
      "valueCode": "return 'i18n'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-blue-600 bg-blue-50 border-blue-200",
      "order": 7
    },
    {
      "id": "info-08",
      "icon": "lucide:server",
      "label": "部署",
      "valueCode": "return 'Edge'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 8
    },
    {
      "id": "info-09",
      "icon": "lucide:smartphone",
      "label": "终端",
      "valueCode": "return 'PWA'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-teal-600 bg-teal-50 border-teal-200",
      "order": 9
    },
    {
      "id": "info-10",
      "icon": "lucide:git-branch",
      "label": "协作",
      "valueCode": "return 'GitFlow'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
      "order": 10
    },
    {
      "id": "info-11",
      "icon": "lucide:chart-line",
      "label": "监控",
      "valueCode": "return 'Sentry'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-lime-600 bg-lime-50 border-lime-200",
      "order": 11
    },
    {
      "id": "info-12",
      "icon": "lucide:wifi",
      "label": "实时",
      "valueCode": "return 'WebSocket'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-orange-600 bg-orange-50 border-orange-200",
      "order": 12
    },
    {
      "id": "info-13",
      "icon": "lucide:shield-check",
      "label": "安全",
      "valueCode": "return 'OAuth'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 13
    },
    {
      "id": "info-14",
      "icon": "lucide:timer",
      "label": "延迟",
      "valueCode": "return '70ms'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-amber-600 bg-amber-50 border-amber-200",
      "order": 14
    },
    {
      "id": "info-15",
      "icon": "lucide:cloud",
      "label": "云端",
      "valueCode": "return 'Vercel'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-sky-600 bg-sky-50 border-sky-200",
      "order": 15
    },
    {
      "id": "info-16",
      "icon": "lucide:sparkle",
      "label": "AI",
      "valueCode": "return 'Agent'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 16
    },
    {
      "id": "info-17",
      "icon": "lucide:box",
      "label": "组件",
      "valueCode": "return '120+'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-rose-600 bg-rose-50 border-rose-200",
      "order": 17
    },
    {
      "id": "info-18",
      "icon": "lucide:bug",
      "label": "缺陷",
      "valueCode": "return '0 Sev1'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-red-600 bg-red-50 border-red-200",
      "order": 18
    },
    {
      "id": "info-19",
      "icon": "lucide:users",
      "label": "用户",
      "valueCode": "return '50w'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 19
    },
    {
      "id": "info-20",
      "icon": "lucide:clipboard-check",
      "label": "测试",
      "valueCode": "return '100%'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-blue-600 bg-blue-50 border-blue-200",
      "order": 20
    },
    {
      "id": "info-21",
      "icon": "lucide:beaker",
      "label": "实验",
      "valueCode": "return 'A/B'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
      "order": 21
    },
    {
      "id": "info-22",
      "icon": "lucide:palette",
      "label": "主题",
      "valueCode": "return '暗黑'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-slate-600 bg-slate-50 border-slate-200",
      "order": 22
    },
    {
      "id": "info-23",
      "icon": "lucide:layout-grid",
      "label": "布局",
      "valueCode": "return '12列'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-cyan-600 bg-cyan-50 border-cyan-200",
      "order": 23
    },
    {
      "id": "info-24",
      "icon": "lucide:pie-chart",
      "label": "报表",
      "valueCode": "return '28种'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-amber-600 bg-amber-50 border-amber-200",
      "order": 24
    },
    {
      "id": "info-25",
      "icon": "lucide:clock-3",
      "label": "周期",
      "valueCode": "return '2月'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-indigo-600 bg-indigo-50 border-indigo-200",
      "order": 25
    },
    {
      "id": "info-26",
      "icon": "lucide:folder-open",
      "label": "模块",
      "valueCode": "return '9域'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-teal-600 bg-teal-50 border-teal-200",
      "order": 26
    },
    {
      "id": "info-27",
      "icon": "lucide:calendar",
      "label": "迭代",
      "valueCode": "return '双周'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 27
    },
    {
      "id": "info-28",
      "icon": "lucide:link",
      "label": "接口",
      "valueCode": "return '68个'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-rose-600 bg-rose-50 border-rose-200",
      "order": 28
    },
    {
      "id": "info-29",
      "icon": "lucide:award",
      "label": "满意度",
      "valueCode": "return '96%'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 29
    }
  ],
  "featureHighlights": [
    {
      "id": "feature-smart-dashboard",
      "title": "智能可视化工作台",
      "description": "多角色仪表盘统一在同一前端工程中，通过动态模块装载与缓存策略实现毫秒级切换，同时提供 Markdown 自定义区块，方便运营即时编排内容。",
      "techStack": [
        {
          "id": "tag-vue",
          "name": "Vue 3",
          "color": "from-emerald-500 to-emerald-600",
          "bgColor": "bg-emerald-50 hover:bg-emerald-100",
          "textColor": "text-emerald-700",
          "borderColor": "border-emerald-200"
        },
        {
          "id": "tag-echarts",
          "name": "ECharts",
          "color": "from-sky-500 to-indigo-600",
          "bgColor": "bg-sky-50 hover:bg-sky-100",
          "textColor": "text-sky-700",
          "borderColor": "border-sky-200"
        }
      ],
      "screenshots": [
        {
          "id": "241313f8-3413-4152-84de-77165bfc612a",
          "name": "seepro_i2v.png",
          "description": "智能看板布局",
          "url": "http://localhost:8000/uploads/zkeq/feature-feature-1759741245475/2746cea9a01b4f4b8d1cda7f558d4615.png"
        }
      ],
      "previewUrl": "https://icodeq.com",
      "mobilePreviewUrl": "https://icodeq.com",
      "leftMarkdown": "- 组件拖拽布局\n- 数据源热切换\n- 快捷指标模板",
      "rightMarkdown": "- 支持多语言\n- 深浅色自动适配"
    },
    {
      "id": "feature-ai-ops",
      "title": "AI 驱动的运维助手",
      "description": "接入自研 Agent，在表单、发布、告警等场景提供自动化建议，实现配置 JSON 一键生成、变更提醒与可回滚策略。",
      "techStack": [
        {
          "id": "tag-next",
          "name": "Next.js",
          "color": "from-purple-500 to-purple-600",
          "bgColor": "bg-purple-50 hover:bg-purple-100",
          "textColor": "text-purple-700",
          "borderColor": "border-purple-200"
        },
        {
          "id": "tag-openai",
          "name": "OpenAI",
          "color": "from-amber-500 to-amber-600",
          "bgColor": "bg-amber-50 hover:bg-amber-100",
          "textColor": "text-amber-700",
          "borderColor": "border-amber-200"
        }
      ],
      "screenshots": [
        {
          "id": "image-ai-assistant",
          "name": "agent-flow.png",
          "description": "智能助手处理发布任务",
          "url": "http://localhost:8000/uploads/zkeq/timeline/bf0c20a29d6b4b1d9b0e5e448d0bfcdb.png"
        }
      ],
      "previewUrl": "https://icodeq.com",
      "mobilePreviewUrl": "https://icodeq.com",
      "leftMarkdown": "- 表单草稿自动生成\n- 版本对比一键查看",
      "rightMarkdown": "- 告警语义解读\n- 建议含执行脚本"
    }
  ],
  "projectIntroduction": "SparkAI Frontend 在企业级 AI 面板场景下兼顾性能、可扩展性与运营效率。前端采用 Vue 3 + Vite 组合，通过模块懒加载、骨架屏和离线缓存保证 50w 月活下的稳定体验；BFF 层由 Next.js 提供数据聚合与安全网关，统一对接权限、告警与运营投放。管理端支持 30 项项目信息卡片、Markdown 自定义栏与截图资产管理，配合 JSON 提示词指南让团队快速生成配置。项目内置 CI/CD 流水线、Sentry 监控以及多环境灰度方案，实现分钟级发布与自动回滚，已在多个 AIGC SaaS 客户落地。",
  "longDescription": "",
  "createdAt": "2024-12-01T08:05:25.335Z",
  "updatedAt": "2025-01-18T03:28:47.244Z",
  "timeline_items": [
    {
      "id": "sparkai-update-001",
      "project_id": "sparkai-frontend",
      "publishedAt": "2024-12-20T16:00:00.000Z",
      "author": {
        "name": "zkeq",
        "avatar": "",
        "username": "zkeq"
      },
      "project": {
        "id": "sparkai-frontend",
        "name": "SparkAI Frontend 前端项目",
        "logo": "",
        "description": "引入 JSON 提示词工作流",
        "techStack": [
          "Vue 3",
          "Next.js",
          "TypeScript"
        ],
        "readme": "feat: 引入提示词指南与 JSON 表单联动",
        "previewImages": [
          "http://localhost:8000/uploads/zkeq/timeline/bf0c20a29d6b4b1d9b0e5e448d0bfcdb.png"
        ],
        "repositoryUrl": "https://github.com/zkeq/Coding",
        "liveUrl": "https://icodeq.com",
        "mobileUrl": "https://icodeq.com"
      },
      "updateType": "feature",
      "updateTypeMeta": {
        "id": "feature",
        "label": "新功能",
        "color": "#22c55e"
      },
      "changelog": "新增 JSON 提示词面板并完善配置同步",
      "tags": [
        {
          "id": "performance",
          "label": "性能优化",
          "icon": "flame"
        },
        {
          "id": "code-update",
          "label": "代码更新",
          "icon": "code2"
        }
      ],
      "details": "feat(admin): 引入提示词指南，支持一键生成项目配置 JSON",
      "demoIntroduction": {
        "left": "演示包括 JSON 提示与表单互通",
        "right": "可实时校验提示生成内容"
      },
      "links": {
        "repository": "https://github.com/zkeq/Coding",
        "demo": "https://icodeq.com",
        "mobile": "https://icodeq.com"
      },
      "assets": {
        "images": [
          {
            "id": "sparkai-timeline-image-001",
            "url": "http://localhost:8000/uploads/zkeq/timeline/bf0c20a29d6b4b1d9b0e5e448d0bfcdb.png",
            "filename": "sparkai-json-guide.png",
            "contentType": "image/png",
            "size": 2159906
          }
        ]
      },
      "likes": 8,
      "comments": 0,
      "isLiked": false
    },
    {
      "id": "sparkai-update-002",
      "project_id": "sparkai-frontend",
      "publishedAt": "2025-01-10T10:30:00.000Z",
      "author": {
        "name": "zkeq",
        "avatar": "",
        "username": "zkeq"
      },
      "project": {
        "id": "sparkai-frontend",
        "name": "SparkAI Frontend 前端项目",
        "logo": "",
        "description": "完成度提升",
        "techStack": [
          "Vue 3",
          "Next.js"
        ],
        "readme": "perf: 优化首屏加载与 WebSocket 稳定性",
        "previewImages": [
          "http://localhost:8000/uploads/zkeq/timeline/580e69cb1fad4a16abe766c52f5f9a63.png"
        ],
        "repositoryUrl": "https://github.com/zkeq/Coding",
        "liveUrl": "https://icodeq.com",
        "mobileUrl": "https://icodeq.com"
      },
      "updateType": "bug",
      "updateTypeMeta": {
        "id": "bug",
        "label": "修复BUG",
        "color": "#0ea5e9"
      },
      "changelog": "修复并发下的实时通道闪断问题",
      "tags": [
        {
          "id": "bugfix",
          "label": "问题修复",
          "icon": "bug"
        },
        {
          "id": "code-update",
          "label": "代码更新",
          "icon": "code2"
        }
      ],
      "details": "fix(socket): 稳定 WebSocket 重连并补齐监控日志",
      "demoIntroduction": {
        "left": "演示实时告警推送",
        "right": "展示移动端同步能力"
      },
      "links": {
        "repository": "https://github.com/zkeq/Coding",
        "demo": "https://icodeq.com",
        "mobile": "https://icodeq.com"
      },
      "assets": {
        "images": [
          {
            "id": "sparkai-timeline-image-002",
            "url": "http://localhost:8000/uploads/zkeq/timeline/580e69cb1fad4a16abe766c52f5f9a63.png",
            "filename": "sparkai-realtime.png",
            "contentType": "image/png",
            "size": 2159906
          }
        ]
      },
      "likes": 12,
      "comments": 1,
      "isLiked": false
    }
  ],
  "homeAttributes": [
    {
      "id": "home-tech",
      "icon": "lucide:settings",
      "label": "技术栈",
      "valueCode": "return 'Vue3+Next'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-blue-600 bg-blue-50 border-blue-200",
      "order": 0
    },
    {
      "id": "home-traffic",
      "icon": "TrendingUp",
      "label": "月访问量",
      "valueCode": "return '50w'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 1
    },
    {
      "id": "home-cycle",
      "icon": "Clock",
      "label": "开发周期",
      "valueCode": "return '2月'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-indigo-600 bg-indigo-50 border-indigo-200",
      "order": 2
    },
    {
      "id": "home-completion",
      "icon": "CheckCircle",
      "label": "完成度",
      "valueCode": "return '100%'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 3
    }
  ],
  "sidebarAttributes": [
    {
      "id": "side-tech",
      "icon": "lucide:settings",
      "label": "技术栈",
      "valueCode": "return 'Vue3+Next'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-blue-600 bg-blue-50 border-blue-200",
      "order": 0
    },
    {
      "id": "side-traffic",
      "icon": "TrendingUp",
      "label": "月访问量",
      "valueCode": "return '50w'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 1
    },
    {
      "id": "side-cycle",
      "icon": "Clock",
      "label": "开发周期",
      "valueCode": "return '2月'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-indigo-600 bg-indigo-50 border-indigo-200",
      "order": 2
    },
    {
      "id": "side-completion",
      "icon": "CheckCircle",
      "label": "完成度",
      "valueCode": "return '100%'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 3
    },
    {
      "id": "side-security",
      "icon": "Shield",
      "label": "安全级别",
      "valueCode": "return '企业级'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-slate-600 bg-slate-50 border-slate-200",
      "order": 4
    },
    {
      "id": "side-support",
      "icon": "Headset",
      "label": "支持时间",
      "valueCode": "return '7x24'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-amber-600 bg-amber-50 border-amber-200",
      "order": 5
    },
    {
      "id": "side-release",
      "icon": "Send",
      "label": "发布频率",
      "valueCode": "return '双周'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-teal-600 bg-teal-50 border-teal-200",
      "order": 6
    },
    {
      "id": "side-quality",
      "icon": "BadgeCheck",
      "label": "质量评级",
      "valueCode": "return 'A+'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": false,
      "color": "text-rose-600 bg-rose-50 border-rose-200",
      "order": 7
    }
  ],
  "heroAttributes": [
    {
      "id": "hero-traffic",
      "icon": "TrendingUp",
      "label": "月访问量",
      "valueCode": "return '50w'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": true,
      "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
      "order": 0
    },
    {
      "id": "hero-cycle",
      "icon": "Clock",
      "label": "开发周期",
      "valueCode": "return '2月'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": true,
      "color": "text-indigo-600 bg-indigo-50 border-indigo-200",
      "order": 1
    },
    {
      "id": "hero-completion",
      "icon": "CheckCircle",
      "label": "完成度",
      "valueCode": "return '100%'",
      "showInHomepage": true,
      "showInSidebar": true,
      "showInHero": true,
      "color": "text-purple-600 bg-purple-50 border-purple-200",
      "order": 2
    }
  ]
}
`;
