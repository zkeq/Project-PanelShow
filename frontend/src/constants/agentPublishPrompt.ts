import { CANONICAL_API_ORIGIN } from "@/lib/site-domain";

export function agentPublishPrompt({
  apiOrigin,
  key,
  site,
  projectId,
}: {
  apiOrigin: string;
  key: string;
  site: string;
  projectId: string | null;
}) {
  const action = projectId
    ? `更新 ${site} 的作品 ${projectId}。先读取 ${apiOrigin}/api/projects/${encodeURIComponent(site)}/${encodeURIComponent(projectId)}，仅提交需要更新的字段。`
    : `为 ${site} 创建一个新的公开作品。请在本轮实际发布。`;

  return `请阅读当前工作区的项目，把它整理成一份可公开展示的 PanelShow 技术作品。 ${action}

接口规范：${apiOrigin}/api/agent/v1/schema
发布 API：${apiOrigin}
本次发布密钥：${key}

### 1. 找到能代表项目的体验

阅读 README、依赖清单、应用入口、关键组件、服务端实现、测试和部署配置。找到线上演示或运行本地版本，实际操作至少一条完整路径。遇到动画、播放、实时同步、数据流或复杂编辑器时，进入实际交互界面，触发核心操作，观察前后状态并对照源码。记录每项亮点的入口、实现文件、可观察结果和适合公开展示的素材。若工作区有多个独立项目且意图不明，先确认目标。

### 2. 用作品集语言填写名称和说明

name 填项目在应用、README 或仓库中使用的正式名称。找不到正式名称时，用仓库名或直接说明用途的功能名称。需要补充定位时，加一个能说明产品类型或用途的短后缀，例如「Tempo · 个人音乐时间轴」。名称填写纯文本。更新现有作品时沿用当前名称，用户要求改名时再修改。

description 用一句话说清项目提供什么功能，供作品卡片展示。introduction 的首段直接交代项目定位、核心功能和最值得看的实现。已验证的演示可以放在对应段落，说明访客点哪里、会看到什么。

正文按真实功能组织。小节用无编号的标题，小节和亮点都用「逐句歌词与四边屏光联动」这样的具体功能或机制命名。用短段落写清关键技术各自负责什么、数据或状态如何流转，以及它对使用体验的影响。例如播放器用播放时钟定位当前歌词，同一行索引驱动文字高光和四边屏光，点一句歌词就能验证这三处变化。适合对照的技术与职责可用表格整理，工程取舍、异常处理和验证结果放在相关功能旁边。省略宣传词、故事式开场、装饰性编号和与亮点无关的文件清单。

复杂项目的正文通常约 2,500–4,000 个字符，以讲清核心实现为准。用已经实现和验证的事实支撑结论。按用户明确的公开范围写正文、亮点、概览和架构图，第三方接入统一描述可公开的 SDK 或接口职责。

写复杂项目的说明前，先 GET 以下两个公开 API，读取 JSON 响应中的 data.projectIntroduction，参考项目说明的结构和技术深度。正文内容以当前项目的实际实现为准。

- SparkAI 视频生成平台 ${CANONICAL_API_ORIGIN}/api/projects/zkeq/sparkai-video-extend-v6.6.4
- SparkAI 前端 ${CANONICAL_API_ORIGIN}/api/projects/zkeq/sparkai-frontend-v6.6.4-new

复杂项目应在 introduction 的 Markdown 正文中用标记为 mermaid 的代码围栏画一张架构图，PanelShow 会渲染它。图应按实际实现标出关键模块、前后端或外部接口的边界，并用箭头说明数据流或职责关系。简单项目可按需要省略架构图。

### 3. 准备 20 项概览并规划展示位

overview 必须是 20 个不同的项，每项填写 label、简短 value 和语义对应的 icon。用接口规范中的 Iconify 官方集合、图标清单或搜索链接查询，每项从官方结果自己选择并填写完整的「图标集:图标名」。亮点也可按同样方式填写 icon。tags 另作主题分类。把最能概括项目的 4 项放第 1–4 位，帮助理解关键实现的 4 项放第 5–8 位，其余可核实细节放第 9–20 位。首页显示前 4 项，详情侧栏显示前 8 项，详情概览显示全部 20 项。

技术栈和设计方式等固定事实直接填 value。需要动态展示公开指标时，同时填写 value_api 和有意义的静态 value。使用无需凭据、支持浏览器 CORS 的公开 HTTPS JSON GET 接口，先验证实际响应，再用 json_path 指定要读的字段。例如 GitHub Star 数的 value_api 可填 {"url":"https://api.github.com/repos/zkeq/Project-PanelShow","json_path":["stargazers_count"],"suffix":" stars"}。嵌套字段用多个键，例如 ["data","total"]。结果应是简短字符串或数字。请求期间、请求失败或数据缺失时，页面显示 value。示例地址请换成当前作品自己的公开数据源。

需要条件判断或自定义计算时，管理端「动态信息值代码」接受 JavaScript 函数体 valueCode，可以用 await fetch(...)，检查 response.ok，解析 JSON 并 return 字符串或数字。例如 const res = await fetch("https://api.github.com/repos/zkeq/Project-PanelShow"); if (!res.ok) return "暂无数据"; const data = await res.json(); return data.stargazers_count + " stars";。这种脚本可在交付时提供给作者粘贴到管理端，Agent 发布请求里的动态读数使用 value_api。公开作品的值、脚本和数据源不要包含凭据或私密内容。

### 4. 主动截图并准备演示

选择 3–6 个有区分度的亮点，把核心体验排第一。先检查能否使用浏览器、设备或截图工具。当 Agent 具备截图能力时，必须主动打开线上演示或启动本地项目，亲手操作关键功能，并在本轮拍摄真实运行画面。每个可视化亮点拍摄 4–6 张，覆盖关键动作和不同状态。动态效果至少拍摄两个可辨别的实际时刻。

桌面默认输出 2560×1440，移动端保持原比例，长边目标 2560 像素。每次截图前等内容、字体和可见图片加载完成，确认没有骨架屏、裂图或空白。首张主图是封面，为每张图提供简短 title 和说明确切状态的 caption。demo_url 指向可直接体验的页面。检查截图和正文中的敏感内容。确实没有截图能力时，跳过截图字段并继续发布，在交付时说明原因。若截图工具可用但项目无法运行或访问，说明实际尝试和遇到的阻碍。

### 5. 提交前校验并确认发布

预审正文深度和可读性、复杂项目的 Mermaid 架构图、20 项概览顺序和图标、动态值与静态备用值、演示链接，以及已提供截图的尺寸、加载状态和覆盖范围。

当 Agent 具备截图能力时，先完成第 4 步的主动截图，再把通过检查的图片上传到对应图集。检查单张文件大小符合 schema 的 asset_upload.max_bytes，再向 reserve 接口发送 JSON，按文件填写 content_type 和实际字节数 size。使用响应中 upload.url 和 upload.headers，将原始文件以 PUT 直传腾讯云 COS，逐项带上签名所需的请求头。COS 请求无需 Agent SK。上传成功后，用同一把 SK 调用 complete 接口，再将已确认的 asset_id 填入对应图集。签名 URL 和 SK 都只用于对应请求，避免把它们写进作品说明或交付内容。

SK 七天内可重复使用，只作为 Authorization 请求头中的 Bearer 凭证发送给指定发布 API。每次新提交使用一个新的 Idempotency-Key，同一笔超时重试沿用原键和原内容。

发布成功后，只用返回的 project_id 发起一次 GET ${apiOrigin}/api/projects/${encodeURIComponent(site)}/<project_id>，核对 JSON 中的 data.id 和 data.name。回读只检查这两个字段，随后交付项目名和发布接口返回的公开链接。若回读失败，说明这一次回读的结果。`;
}
