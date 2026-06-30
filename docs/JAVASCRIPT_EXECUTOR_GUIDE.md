# JavaScript 代码执行器使用指南

## 功能概述

项目信息管理器现在支持通过 JavaScript 代码动态计算展示值。该功能允许你在 `valueCode` 字段中编写 JavaScript 代码，代码将在沙箱环境中执行，并返回要展示的值。

## 关键特性

- ✅ **网络请求支持**: 使用 `fetch` API 获取实时数据
- ✅ **异步操作**: 支持 `async/await` 语法
- ✅ **数据处理**: 内置 JSON 解析、数组操作等
- ✅ **缓存机制**: API 响应自动缓存 6 小时
- ✅ **安全沙箱**: 代码在隔离环境中运行
- ⏱️ **执行限制**: 24 秒超时保护

## 使用场景

### 1. GitHub 仓库统计

获取仓库的 Star 数量：

```javascript
const res = await fetch("https://api.github.com/repos/zkeq/Coding")
const data = await res.json()
return data.stargazers_count + " ⭐"
```

### 2. 项目运行天数

自动计算项目运行时长：

```javascript
const start = new Date("2024-01-15")
const days = Math.floor((Date.now() - start) / 86400000)
return days + " 天"
```

### 3. API 健康检测

实时检测 API 状态：

```javascript
try {
  const res = await fetch("https://api.example.com/health")
  return res.ok ? "✅ 运行中" : "⚠️ 异常"
} catch {
  return "❌ 离线"
}
```

### 4. 访问量格式化

智能格式化大数值：

```javascript
const views = 123456
return views > 10000
  ? (views/10000).toFixed(1) + "w"
  : views.toString()
```

### 5. 技术栈版本查询

从 package.json 或 API 获取版本号：

```javascript
const res = await fetch("https://registry.npmjs.org/vue/latest")
const data = await res.json()
return `Vue ${data.version}`
```

## 后端 API 实现

### 端点信息

- **路径**: `/api/execute-js`
- **方法**: `POST`
- **Content-Type**: `application/json`

### 请求格式

```json
{
  "code": "return 'Hello World'"
}
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "result": "Hello World",
  "cached": false
}
```

#### 缓存响应

```json
{
  "success": true,
  "result": "Hello World",
  "cached": true,
  "cached_at": "2025-10-11T10:30:00.000Z"
}
```

#### 错误响应

```json
{
  "detail": "执行错误: ReferenceError: undefined variable"
}
```

## 安全限制

### ✅ 允许的操作

- 使用 `fetch` 进行网络请求
- Promise 和 async/await
- 基础 JavaScript 运算和数据处理
- `console.log` 调试输出
- `setTimeout`, `setInterval` 定时器

### ❌ 禁止的操作

- 访问文件系统 (`fs` 模块)
- 访问 DOM (`document`, `window`)
- 使用 `import` 或 `require`
- 执行系统命令
- 访问敏感环境变量

## 最佳实践

### 1. 错误处理

始终使用 try-catch 包裹可能失败的操作：

```javascript
try {
  const res = await fetch("https://api.example.com/data")
  const data = await res.json()
  return data.value
} catch (error) {
  return "获取失败"
}
```

### 2. 超时处理

对于可能很慢的请求，考虑添加超时逻辑：

```javascript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 20000)

try {
  const res = await fetch("https://slow-api.com/data", {
    signal: controller.signal
  })
  clearTimeout(timeoutId)
  return (await res.json()).value
} catch {
  return "请求超时"
}
```

### 3. 数据验证

在使用数据前进行验证：

```javascript
const res = await fetch("https://api.github.com/repos/owner/repo")
const data = await res.json()

if (!data || typeof data.stargazers_count !== 'number') {
  return "数据无效"
}

return data.stargazers_count + " stars"
```

### 4. 简洁的代码

保持代码简洁易读：

```javascript
// ✅ 推荐
const days = Math.floor((Date.now() - new Date("2024-01-01")) / 86400000)
return days + " 天"

// ❌ 避免
const startDate = new Date("2024-01-01")
const currentDate = new Date()
const timeDifference = currentDate.getTime() - startDate.getTime()
const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
return daysDifference + " 天运行时间"
```

## 缓存机制

### 缓存策略

- 使用代码的 SHA-256 哈希作为缓存键
- 缓存有效期：6 小时（21600 秒）
- 自动清理过期缓存

### 强制刷新

要强制刷新缓存，只需修改代码（即使是添加注释）：

```javascript
// v1.0
return "Hello"

// v1.1 - 添加注释强制刷新缓存
return "Hello"
```

## 在前端使用

### Hook 使用

```tsx
import { useExecuteCode } from '@/hooks/useExecuteCode';

function MyComponent() {
  const { value, loading, error } = useExecuteCode(
    'return "Hello World"',
    '加载中...'
  );

  return <div>{loading ? '加载中...' : value}</div>;
}
```

### ProjectInfoManager 中的应用

在项目信息管理器中，`valueCode` 字段的 placeholder 现在包含完整的使用指南：

```tsx
<Textarea
  id="valueCode"
  value={formData.valueCode}
  onChange={(e) => setFormData(prev => ({ ...prev, valueCode: e.target.value }))}
  placeholder={JS_CODE_EXECUTOR_GUIDE}
  rows={8}
  className="font-mono text-sm"
/>
```

## 实用示例集合

### 天气信息

```javascript
const res = await fetch("https://api.openweathermap.org/data/2.5/weather?q=Beijing&appid=YOUR_KEY")
const data = await res.json()
return `${data.main.temp}°C`
```

### 实时汇率

```javascript
const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
const data = await res.json()
return `1 USD = ${data.rates.CNY.toFixed(2)} CNY`
```

### 博客文章数

```javascript
const res = await fetch("https://api.example.com/blog/posts/count")
const data = await res.json()
return `${data.count} 篇文章`
```

### 用户在线状态

```javascript
const res = await fetch("https://api.example.com/user/status")
const { online } = await res.json()
return online ? "🟢 在线" : "🔴 离线"
```

### 项目完成度

```javascript
const total = 100
const completed = 75
const percentage = (completed / total * 100).toFixed(1)
return `${percentage}% 完成`
```

## 常见问题

### Q: 为什么我的代码没有返回值？

A: 确保你的代码使用了 `return` 语句。如果是异步操作，确保使用了 `await`。

### Q: 如何调试我的代码？

A: 可以使用 `console.log()` 输出调试信息，这些信息会显示在后端日志中。

### Q: 缓存多久会过期？

A: 缓存在 6 小时后自动过期。你也可以通过修改代码来强制刷新。

### Q: 可以使用第三方 npm 包吗？

A: 不可以。代码在沙箱环境中运行，不支持 `import` 或 `require`。只能使用内置的全局对象。

### Q: 如何处理 CORS 问题？

A: 后端执行代码时不受浏览器 CORS 限制。但请确保 API 服务器允许来自你服务器 IP 的请求。

## 技术架构

### 沙箱实现

后端使用 Node.js 的 `vm` 模块创建沙箱环境：

```python
js_code = '''
const vm = require('vm');

const sandbox = {
    console: console,
    setTimeout: setTimeout,
    Promise: Promise,
    fetch: fetch,
};

const context = vm.createContext(sandbox);
const result = vm.runInContext(userCode, context, {
    timeout: 24000,
    displayErrors: true
});
'''
```

### 缓存实现

使用内存字典存储缓存：

```python
js_execution_cache = {
    "code_hash": {
        "result": "computed_value",
        "cached_at": datetime.utcnow()
    }
}
```

## 未来计划

- [ ] 支持更多内置工具函数
- [ ] 添加代码语法高亮
- [ ] 提供代码模板库
- [ ] 支持代码版本历史
- [ ] 添加性能监控面板

## 相关文件

- **常量定义**: `/frontend/src/constants/projectJsonPrompt.ts`
- **组件实现**: `/frontend/src/components/admin/ProjectInfoManager.tsx`
- **Hook**: `/frontend/src/hooks/useExecuteCode.tsx`
- **后端 API**: `/backend/main.py` (`/api/execute-js`)

---

**更新日期**: 2025-10-11
**版本**: 1.0.0
