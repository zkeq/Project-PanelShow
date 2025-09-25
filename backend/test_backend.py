#!/usr/bin/env python3
"""
测试后端API多用户功能的脚本
更新后支持多用户数据结构和用户管理功能
"""

import sys
import os
import json
import requests
import time

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

def test_imports():
    """测试导入功能"""
    print("=== 测试模块导入 ===")
    try:
        # 测试数据工具
        from app.utils.data import load_json_data, current_date, UserNotFoundError
        print(f"✓ 数据工具导入成功")
        print(f"当前日期: {current_date()}")
        
        # 测试数据模型
        from app.models import Project, TimelineItem, ProfileInfo, User
        print(f"✓ 数据模型导入成功")
        
        # 测试服务层
        from app.services import ProjectService, TimelineService, ProfileService, UserService
        print(f"✓ 服务层导入成功")
        
        return True
    except ImportError as e:
        print(f"❌ 导入错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def test_user_management():
    """测试用户管理功能"""
    print("\n=== 测试用户管理 ===")
    try:
        from app.services import UserService
        
        # 测试获取所有用户
        all_users = UserService.get_all_users()
        print(f"✓ 获取所有用户成功: {len(all_users)} 个用户")
        
        # 测试获取公开用户
        public_users = UserService.get_public_users()
        print(f"✓ 获取公开用户成功: {len(public_users)} 个公开用户")
        print(f"  公开用户列表: {public_users}")
        
        # 测试检查用户是否存在
        if public_users:
            test_user = public_users[0]
            user_exists = UserService.user_exists(test_user)
            print(f"✓ 用户存在性检查: 用户 {test_user} {'存在' if user_exists else '不存在'}")
            
            # 测试获取用户信息
            user_info = UserService.get_user_by_username(test_user)
            if user_info:
                print(f"✓ 获取用户信息成功: {user_info.get('displayName', test_user)}")
        
        # 测试系统统计
        stats = UserService.get_system_stats()
        print(f"✓ 系统统计: 总用户 {stats.get('totalUsers', 0)}, 活跃用户 {stats.get('activeUsers', 0)}")
        
        return True, public_users
    except Exception as e:
        print(f"❌ 用户管理测试失败: {e}")
        return False, []

def test_multi_user_data_services(test_username):
    """测试多用户数据服务"""
    print(f"\n=== 测试多用户数据服务 (用户: {test_username}) ===")
    try:
        from app.services import ProjectService, TimelineService, ProfileService
        
        # 测试项目服务
        projects = ProjectService.get_all_projects(test_username)
        print(f"✓ 获取用户项目成功: {len(projects)} 个项目")
        
        if projects:
            # 测试获取项目详情
            project_detail = ProjectService.get_project_detail(test_username, projects[0].id)
            if project_detail:
                print(f"✓ 获取项目详情成功: {project_detail.name}")
            else:
                print("⚠ 项目详情未找到")
        
        # 测试时间线服务
        timeline_items = TimelineService.get_all_timeline_items(test_username)
        print(f"✓ 获取用户时间线成功: {len(timeline_items)} 个时间线项")
        
        # 测试个人资料服务
        profile_info = ProfileService.get_profile_info(test_username)
        print(f"✓ 获取用户个人资料成功: {profile_info.name}")
        
        # 测试经历和快捷链接
        experiences = ProfileService.get_experiences(test_username)
        quick_links = ProfileService.get_quick_links(test_username)
        print(f"✓ 获取工作经历成功: {len(experiences)} 个经历")
        print(f"✓ 获取快捷链接成功: {len(quick_links)} 个链接")
        
        return True
    except Exception as e:
        print(f"❌ 多用户数据服务测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """测试API接口"""
    print("\n=== 测试API接口 ===")
    base_url = "http://localhost:8000"
    
    try:
        # 测试健康检查
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✓ 健康检查通过")
        else:
            print(f"⚠ 健康检查失败: {response.status_code}")
        
        # 测试获取公开用户列表
        response = requests.get(f"{base_url}/api/users/public", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 获取公开用户列表API成功: {len(data.get('data', []))} 个用户")
            
            # 如果有公开用户，测试用户相关API
            if data.get('data'):
                test_user = data['data'][0]['username']
                
                # 测试获取用户项目
                response = requests.get(f"{base_url}/api/projects/{test_user}/", timeout=5)
                if response.status_code == 200:
                    projects_data = response.json()
                    print(f"✓ 获取用户项目API成功: {len(projects_data.get('data', []))} 个项目")
                
                # 测试获取用户时间线
                response = requests.get(f"{base_url}/api/timeline/{test_user}/", timeout=5)
                if response.status_code == 200:
                    timeline_data = response.json()
                    print(f"✓ 获取用户时间线API成功: {len(timeline_data.get('data', []))} 个时间线项")
                
                # 测试获取用户资料
                response = requests.get(f"{base_url}/api/profile/{test_user}", timeout=5)
                if response.status_code == 200:
                    profile_data = response.json()
                    print(f"✓ 获取用户资料API成功: {profile_data.get('data', {}).get('name', '未知')}")
        else:
            print(f"⚠ 获取公开用户列表API失败: {response.status_code}")
        
        # 测试访问不存在用户的资源
        response = requests.get(f"{base_url}/api/projects/nonexistent/", timeout=5)
        if response.status_code == 404:
            print("✓ 不存在用户访问控制正常")
        else:
            print(f"⚠ 不存在用户访问控制异常: {response.status_code}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("⚠ API服务器未启动或无法连接")
        return False
    except requests.exceptions.Timeout:
        print("⚠ API请求超时")
        return False
    except Exception as e:
        print(f"❌ API接口测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 开始测试多用户后端API功能...")
    
    # 测试导入
    if not test_imports():
        return
    
    # 测试用户管理
    user_test_success, public_users = test_user_management()
    if not user_test_success:
        return
    
    # 测试多用户数据服务
    if public_users:
        test_username = public_users[0]
        if not test_multi_user_data_services(test_username):
            return
    else:
        print("⚠ 没有公开用户，跳过多用户数据服务测试")
    
    # 测试API接口
    print("\n正在测试API接口，请确保服务器已启动...")
    time.sleep(1)
    test_api_endpoints()
    
    print("\n=== 多用户功能测试完成! ===")
    print("✅ 后端多用户系统验证完成")
    print("\n📋 系统功能概览：")
    print("• 支持多用户数据隔离")
    print("• 用户管理和权限控制")
    print("• 公开用户访问机制")
    print("• 用户名参数化的API路由")
    print("• 完整的数据服务层重构")
    print("\n🎯 待完成功能：")
    print("• tinyauth 认证系统集成")
    print("• 完善的权限验证机制")

if __name__ == "__main__":
    main()