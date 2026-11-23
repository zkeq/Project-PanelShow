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

name 填项目正式名称，可加简短用途，例如「Tempo · 个人音乐时间轴」。编辑已有作品时沿用原名。description 用一句话说明项目做什么。

introduction 用作品集的语言，以 Markdown 对项目做详细的总结，简洁明了，不要废话。直接写核心功能、关键技术、实现原理和可核实的亮点。小节用无编号的功能标题，同一个实现只讲一次。第三方接入按用户指定的公开范围写 SDK 或接口职责。

复杂项目通过下面两个 API 读取 data.projectIntroduction，参考它们解释技术实现的写法，再用 mermaid 代码围栏画一张简洁架构图。

- SparkAI 视频生成平台 ${CANONICAL_API_ORIGIN}/api/projects/zkeq/sparkai-video-extend-v6.6.4
- SparkAI 前端 ${CANONICAL_API_ORIGIN}/api/projects/zkeq/sparkai-frontend-v6.6.4-new

### 3. 准备 20 项概览并规划展示位

overview 必须是 20 个不同的项，每项填写 label、简短 value 和语义对应的 icon。用接口规范中的 Iconify 官方集合、图标清单或搜索链接查询，每项从官方结果自己选择并填写完整的「图标集:图标名」。亮点也可按同样方式填写 icon。tags 另作主题分类。把最能概括项目的 4 项放第 1–4 位，帮助理解关键实现的 4 项放第 5–8 位，其余可核实细节放第 9–20 位。首页显示前 4 项，详情侧栏显示前 8 项，详情概览显示全部 20 项。

固定值填 value。动态指标同时填静态 value 和 value_api，使用公开、无需凭据且支持 CORS 的 HTTPS JSON GET 接口。先验证响应，再用 json_path 指定字符串或数值字段。例如 {"url":"https://api.github.com/repos/zkeq/Project-PanelShow","json_path":["stargazers_count"],"suffix":" stars"}，嵌套字段写 ["data","total"]。使用当前作品的数据源。

自定义动态计算在管理端填 valueCode。填写 JavaScript 函数体，可用 await fetch(...) 读取公开 API，解析 JSON 后 return 字符串或数字。Agent 发布请求的动态指标填 value_api。展示值、脚本和数据源只使用可公开的信息。

### 4. 主动截图并准备演示

选择 3–6 个有区分度的亮点，把核心体验排第一。先检查能否使用浏览器、设备或截图工具。当 Agent 具备截图能力时，必须主动打开线上演示或启动本地项目，亲手操作关键功能，并在本轮拍摄真实运行画面。每个可视化亮点拍摄 4–6 张，覆盖关键动作和不同状态。动态效果至少拍摄两个可辨别的实际时刻。

桌面默认输出 2560×1440，移动端保持原比例，长边目标 2560 像素。每次截图前等内容、字体和可见图片加载完成，确认没有骨架屏、裂图或空白。首张主图是封面，为每张图提供简短 title 和说明确切状态的 caption。demo_url 指向可直接体验的页面。检查截图和正文中的敏感内容。确实没有截图能力时，跳过截图字段并继续发布。

### 5. 提交前校验并确认发布

提交前按 schema 核对字段、概览顺序、图标和演示链接。

当 Agent 具备截图能力时，先完成第 4 步的主动截图，再把通过检查的图片上传到对应图集。检查单张文件大小符合 schema 的 asset_upload.max_bytes，再向 reserve 接口发送 JSON，按文件填写 content_type 和实际字节数 size。使用响应中 upload.url 和 upload.headers，将原始文件以 PUT 直传腾讯云 COS，逐项带上签名所需的请求头。COS 请求无需 Agent SK。上传成功后，用同一把 SK 调用 complete 接口，再将已确认的 asset_id 填入对应图集。签名 URL 和 SK 都只用于对应请求，避免把它们写进作品说明或交付内容。

SK 七天内可重复使用，只作为 Authorization 请求头中的 Bearer 凭证发送给指定发布 API。每次新提交使用一个新的 Idempotency-Key，同一笔超时重试沿用原键和原内容。

发布成功后，只用返回的 project_id 发起一次 GET ${apiOrigin}/api/projects/${encodeURIComponent(site)}/<project_id>，核对 JSON 中的 data.id 和 data.name，随后交付项目名和发布接口返回的公开链接。`;
}
