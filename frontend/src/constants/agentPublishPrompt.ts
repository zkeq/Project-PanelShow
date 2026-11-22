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

  return `请阅读当前工作区的项目，把它整理成一篇可公开展示的 PanelShow 作品。 ${action}

接口规范：${apiOrigin}/api/agent/v1/schema
发布 API：${apiOrigin}
本次发布密钥：${key}

1. 阅读 README、依赖清单、项目入口、核心业务代码和测试。找出目标用户、一个典型场景、关键设计和目前的边界。如果工作区有多个独立项目且无法确定意图，先问我选哪一个。

2. 写一句话简介，说明谁能用它做成什么。正文用 Markdown 写清场景、使用流程、技术设计、已验证结果和限制。提炼 3–6 个有证据的亮点，每项写清用户操作、可见结果和关键实现。复杂的状态或数据流可以用 Mermaid 说明。使用标准 Markdown 和 Mermaid 代码块。

3. 优先用项目已有公开图片，或运行项目并截取真实流程。用可公开的数据填充画面，检查图片和正文中的私密内容。给每张图写明画面及所属亮点。素材不足时省略相应图片。性能、使用量、周期、演示地址和开源状态都用可核实的事实。

4. 读取接口规范。用 multipart 的 file 字段上传图片，把返回的 asset_id 写入截图字段。使用规范中的字段提交作品。将 SK 仅作为 Authorization 请求头中的 Bearer 凭证发送给发布 API，保持其独立于日志、文件和作品内容。为发布请求选择稳定的 Idempotency-Key，网络超时后用原键和原内容重试。

5. 检查接口返回的公开链接。回复项目名、链接、亮点和截图数，以及因证据不足省略的内容。如果未收到发布成功响应，说明失败环节和可重试方式。`;
}
