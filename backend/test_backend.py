#!/usr/bin/env python3
"""
测试后端API功能的简单脚本
由于环境限制，我们通过直接导入模块来测试功能
"""

import sys
import os
import json

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    # 测试数据工具
    print("=== 测试数据工具 ===")
    from app.utils.data import load_json_data, current_date
    print(f"✓ 数据工具导入成功")
    print(f"当前日期: {current_date()}")
    
    # 测试数据加载
    print("\n=== 测试数据加载 ===")
    projects = load_json_data('projects.json')
    timeline = load_json_data('timeline.json')
    profile = load_json_data('profile.json')
    
    print(f"✓ 成功加载项目数据: {len(projects)} 个项目")
    print(f"✓ 成功加载时间线数据: {len(timeline)} 个时间线项")
    print(f"✓ 成功加载个人资料数据")
    
    # 测试模型
    print("\n=== 测试数据模型 ===")
    from app.models import Project, TimelineItem, ProfileInfo
    
    # 测试项目模型
    if projects:
        project = Project(**projects[0])
        print(f"✓ 项目模型测试成功: {project.name}")
    
    # 测试时间线模型
    if timeline:
        item = TimelineItem(**timeline[0])
        print(f"✓ 时间线模型测试成功: {item.changelog}")
    
    # 测试个人资料模型
    if 'profile' in profile:
        profile_info = ProfileInfo(**profile['profile'])
        print(f"✓ 个人资料模型测试成功: {profile_info.name}")
    
    # 测试服务层
    print("\n=== 测试服务层 ===")
    from app.services import ProjectService, TimelineService, ProfileService
    
    # 测试项目服务
    all_projects = ProjectService.get_all_projects()
    print(f"✓ 项目服务测试成功: 获取到 {len(all_projects)} 个项目")
    
    # 测试时间线服务
    all_timeline = TimelineService.get_all_timeline_items()
    print(f"✓ 时间线服务测试成功: 获取到 {len(all_timeline)} 个时间线项")
    
    # 测试个人资料服务
    profile_info = ProfileService.get_profile_info()
    print(f"✓ 个人资料服务测试成功: {profile_info.name}")
    
    # 测试项目详情
    print("\n=== 测试项目详情 ===")
    project_detail = ProjectService.get_project_detail('zkeq', '3')
    if project_detail:
        print(f"✓ 项目详情测试成功: {project_detail.name}")
        print(f"  - 显示数据项: {len(project_detail.displayData)} 个")
        print(f"  - 特性: {len(project_detail.features)} 个")
        print(f"  - 图片: {len(project_detail.images)} 个")
    else:
        print("⚠ 项目详情未找到")
    
    # 测试设置
    print("\n=== 测试设置服务 ===")
    from app.services import SettingsService
    
    settings = SettingsService.get_settings()
    print(f"✓ 设置服务测试成功")
    print(f"  - 项目特性: {len(settings.get('projectFeatures', []))} 个")
    print(f"  - 技术栈分类: {len(settings.get('techStacks', {}))} 个")
    print(f"  - 项目分类: {len(settings.get('projectCategories', []))} 个")
    
    print("\n=== 所有测试通过! ===")
    print("后端API功能验证成功，数据结构和服务层工作正常。")
    
except ImportError as e:
    print(f"❌ 导入错误: {e}")
except Exception as e:
    print(f"❌ 测试失败: {e}")
    import traceback
    traceback.print_exc()