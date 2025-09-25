#!/bin/bash

echo "=== 后端认证系统测试脚本 ==="
echo

# 测试后端服务是否运行
echo "1. 检查后端服务状态..."
curl -s http://localhost:8002/health || echo "后端服务未运行，请先启动：cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8002"
echo

# 测试公开接口（无需认证）
echo "2. 测试公开接口（无需认证）..."
echo "获取用户资料："
curl -s -X GET "http://localhost:8002/api/profile/zkeq/info" | jq '.' || curl -s -X GET "http://localhost:8002/api/profile/zkeq/info"
echo

echo "获取用户项目列表："
curl -s -X GET "http://localhost:8002/api/projects/zkeq/" | jq '.data | length' || echo "API调用失败"
echo

# 测试需要认证的接口（应该返回未认证错误）
echo "3. 测试需要认证的接口（应该返回401未认证）..."
echo "尝试创建项目（无认证）："
curl -s -X POST "http://localhost:8002/api/projects/zkeq/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test"}' | grep -o '"detail":"[^"]*"' || echo "请求失败"
echo

# 测试开发模式认证
echo "4. 测试开发模式认证..."
echo "设置DEV_MODE=true并重新测试..."

# 模拟认证头测试
echo "5. 使用模拟认证头测试..."
echo "模拟admin用户创建项目："
curl -s -X POST "http://localhost:8002/api/projects/zkeq/" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: admin" \
  -H "X-Mock-Role: admin" \
  -d '{"name": "Test Project", "description": "Test Description", "category": "web", "status": "active"}' | jq '.' 2>/dev/null || echo "需要启用DEV_MODE"
echo

echo "6. 模拟普通用户测试权限控制..."
echo "普通用户尝试管理其他用户数据（应该失败）："
curl -s -X POST "http://localhost:8002/api/projects/other_user/" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: testuser" \
  -H "X-Mock-Role: user" \
  -d '{"name": "Test Project", "description": "Test"}' | grep -o '"detail":"[^"]*"' || echo "需要启用DEV_MODE"
echo

echo "=== 测试完成 ==="
echo
echo "💡 提示："
echo "- 如果所有测试都返回'未认证'错误，说明认证系统工作正常"
echo "- 要启用开发模式测试，请设置环境变量: export DEV_MODE=true"
echo "- TinyAuth界面地址: http://localhost:3002"
echo "- 默认登录: admin/password"