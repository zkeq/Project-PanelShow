"use client"

import { useEffect, useMemo, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { fetchProjects, fetchTechStacks, updateTechStacks } from "@/lib/api"
import type { Project } from "@/types/store"
import type { TechStackCategory, TechStackChild } from "@/types/tech-stack"
import { StatusToast, type StatusToastState } from "./StatusToast"
import { AlertCircle, Layers, Plus, Trash2, RefreshCw } from "lucide-react"

interface ProjectOption {
  id: string
  name: string
  description?: string
}

interface NormalizedCategory extends TechStackCategory {
  children: Array<NormalizedChild>
}

interface NormalizedChild extends TechStackChild {
  projectIds: string[]
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const createUniqueId = (label: string, existing: Set<string>, fallbackPrefix: string) => {
  const base = slugify(label) || `${fallbackPrefix}-${Date.now()}`
  let candidate = base
  let counter = 1
  while (!candidate || existing.has(candidate)) {
    candidate = `${base}-${counter++}`
  }
  return candidate
}

const DEFAULT_CATEGORY_NAME = "新分类"
const DEFAULT_CHILD_NAME = "新子分类"

export function TechStackSettings() {
  const { token, user } = useAuthStore(
    useShallow((state) => ({ token: state.token, user: state.user }))
  )
  const boundUsername = user?.bound_username ?? null

  const [categories, setCategories] = useState<NormalizedCategory[]>([])
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusToast, setStatusToast] = useState<StatusToastState | null>(null)
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])

  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectOption>()
    for (const project of projectOptions) {
      map.set(project.id, project)
    }
    return map
  }, [projectOptions])

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? null
  const selectedChild = selectedCategory?.children.find((child) => child.id === selectedChildId) ?? null

  useEffect(() => {
    if (!boundUsername || !token) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [techStackRes, projectsRes] = await Promise.all([
          fetchTechStacks(boundUsername, token),
          fetchProjects(boundUsername, token),
        ])

        const rawCategories = Array.isArray(techStackRes.data?.categories)
          ? (techStackRes.data?.categories as TechStackCategory[])
          : []

        const normalizedCategories: NormalizedCategory[] = rawCategories.map((category) => ({
          id: category.id,
          label: category.label,
          icon: category.icon,
          children: Array.isArray(category.children)
            ? category.children.map((child) => ({
                id: child.id,
                label: child.label,
                icon: child.icon,
                description: child.description,
                projectIds: Array.isArray(child.projectIds) ? [...child.projectIds] : [],
              }))
            : [],
        }))

        const projectList = Array.isArray(projectsRes.data)
          ? (projectsRes.data as Project[])
          : []

        const options: ProjectOption[] = projectList
          .filter((project): project is Project & { id: string; name: string } =>
            typeof project?.id === "string" && typeof project?.name === "string"
          )
          .map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
          }))

        setCategories(normalizedCategories)
        setProjectOptions(options)

        const firstCategory = normalizedCategories[0] ?? null
        const firstChild = firstCategory?.children[0] ?? null
        setSelectedCategoryId(firstCategory?.id ?? null)
        setSelectedChildId(firstChild?.id ?? null)
        setSelectedAvailable([])
        setSelectedAssigned([])
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载技术栈配置失败")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [boundUsername, token])

  useEffect(() => {
    setSelectedAvailable([])
    setSelectedAssigned([])
  }, [selectedChildId])

  const handleAddCategory = () => {
    const existingIds = new Set(categories.map((category) => category.id))
    const newId = createUniqueId(DEFAULT_CATEGORY_NAME, existingIds, "category")
    const newCategory: NormalizedCategory = {
      id: newId,
      label: DEFAULT_CATEGORY_NAME,
      icon: "lucide:layers",
      children: [],
    }
    setCategories((prev) => [...prev, newCategory])
    setSelectedCategoryId(newId)
    setSelectedChildId(null)
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== categoryId))
    if (selectedCategoryId === categoryId) {
      const remaining = categories.filter((category) => category.id !== categoryId)
      setSelectedCategoryId(remaining[0]?.id ?? null)
      setSelectedChildId(remaining[0]?.children[0]?.id ?? null)
    }
  }

  const handleCategoryLabelChange = (categoryId: string, label: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, label }
          : category
      )
    )
  }

  const handleCategoryIconChange = (categoryId: string, icon: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, icon }
          : category
      )
    )
  }

  const handleAddChild = (categoryId: string) => {
    let newChildId: string | null = null
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category
        const existingChildIds = new Set(category.children.map((child) => child.id))
        const generatedId = createUniqueId(DEFAULT_CHILD_NAME, existingChildIds, "child")
        newChildId = generatedId
        const newChild: NormalizedChild = {
          id: generatedId,
          label: DEFAULT_CHILD_NAME,
          icon: "lucide:code-2",
          projectIds: [],
        }
        return {
          ...category,
          children: [...category.children, newChild],
        }
      })
    )

    setSelectedCategoryId(categoryId)
    setSelectedChildId((prev) => newChildId ?? prev)
  }

  const handleDeleteChild = (categoryId: string, childId: string) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category
        return {
          ...category,
          children: category.children.filter((child) => child.id !== childId),
        }
      })
    )

    if (selectedChildId === childId) {
      const category = categories.find((item) => item.id === categoryId)
      const remaining = category?.children.filter((child) => child.id !== childId) ?? []
      setSelectedChildId(remaining[0]?.id ?? null)
    }
  }

  const handleChildLabelChange = (categoryId: string, childId: string, label: string) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category
        return {
          ...category,
          children: category.children.map((child) =>
            child.id === childId
              ? { ...child, label }
              : child
          ),
        }
      })
    )
  }

  const handleChildIconChange = (categoryId: string, childId: string, icon: string) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category
        return {
          ...category,
          children: category.children.map((child) =>
            child.id === childId
              ? { ...child, icon }
              : child
          ),
        }
      })
    )
  }

  const availableProjects = useMemo(() => {
    if (!selectedChild) return projectOptions
    const assigned = new Set(selectedChild.projectIds)
    return projectOptions.filter((project) => !assigned.has(project.id))
  }, [projectOptions, selectedChild])

  const assignedProjects = useMemo(() => {
    if (!selectedChild) return []
    return selectedChild.projectIds
      .map((projectId) => projectMap.get(projectId))
      .filter((project): project is ProjectOption => Boolean(project))
  }, [selectedChild, projectMap])

  const handleMoveToAssigned = () => {
    if (!selectedCategory || !selectedChild || selectedAvailable.length === 0) return

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== selectedCategory.id) return category
        return {
          ...category,
          children: category.children.map((child) => {
            if (child.id !== selectedChild.id) return child
            const nextIds = [...child.projectIds]
            for (const project of availableProjects) {
              if (selectedAvailable.includes(project.id) && !nextIds.includes(project.id)) {
                nextIds.push(project.id)
              }
            }
            return { ...child, projectIds: nextIds }
          }),
        }
      })
    )
    setSelectedAvailable([])
  }

  const handleMoveToAvailable = () => {
    if (!selectedCategory || !selectedChild || selectedAssigned.length === 0) return

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== selectedCategory.id) return category
        return {
          ...category,
          children: category.children.map((child) => {
            if (child.id !== selectedChild.id) return child
            return {
              ...child,
              projectIds: child.projectIds.filter((projectId) => !selectedAssigned.includes(projectId)),
            }
          }),
        }
      })
    )
    setSelectedAssigned([])
  }

  const handleSave = async () => {
    if (!boundUsername || !token) return
    setSaving(true)
    setStatusToast(null)
    try {
      const payload = {
        categories: categories.map((category) => ({
          id: category.id,
          label: category.label,
          icon: category.icon,
          children: category.children.map((child) => ({
            id: child.id,
            label: child.label,
            icon: child.icon,
            description: child.description,
            projectIds: child.projectIds,
          })),
        })),
      }
      const response = await updateTechStacks(boundUsername, payload, token)
      const updatedCategories = Array.isArray(response.data?.categories)
        ? (response.data.categories as TechStackCategory[]).map((category) => ({
            id: category.id,
            label: category.label,
            icon: category.icon,
            children: Array.isArray(category.children)
              ? category.children.map((child) => ({
                  id: child.id,
                  label: child.label,
                  icon: child.icon,
                  description: child.description,
                  projectIds: Array.isArray(child.projectIds) ? [...child.projectIds] : [],
                }))
              : [],
          }))
        : []
      setCategories(updatedCategories)
      const categoryExists = updatedCategories.some((category) => category.id === selectedCategoryId)
      if (!categoryExists) {
        const fallbackCategory = updatedCategories[0] ?? null
        setSelectedCategoryId(fallbackCategory?.id ?? null)
        setSelectedChildId(fallbackCategory?.children[0]?.id ?? null)
      } else if (selectedCategoryId) {
        const currentCategory = updatedCategories.find((category) => category.id === selectedCategoryId)
        const childExists = currentCategory?.children.some((child) => child.id === selectedChildId)
        if (!childExists) {
          setSelectedChildId(currentCategory?.children[0]?.id ?? null)
        }
      }
      setStatusToast({ type: "success", message: "技术栈分类已更新" })
    } catch (err) {
      setStatusToast({ type: "error", message: err instanceof Error ? err.message : "保存失败" })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!boundUsername || !token) return
    setSelectedAvailable([])
    setSelectedAssigned([])
    setStatusToast(null)
    setError(null)
    setLoading(true)
    ;(async () => {
      try {
        const response = await fetchTechStacks(boundUsername, token)
        const rawCategories = Array.isArray(response.data?.categories)
          ? (response.data?.categories as TechStackCategory[])
          : []
        const normalized: NormalizedCategory[] = rawCategories.map((category) => ({
          id: category.id,
          label: category.label,
          icon: category.icon,
          children: Array.isArray(category.children)
            ? category.children.map((child) => ({
                id: child.id,
                label: child.label,
                icon: child.icon,
                description: child.description,
                projectIds: Array.isArray(child.projectIds) ? [...child.projectIds] : [],
              }))
            : [],
        }))
        setCategories(normalized)
        const firstCategory = normalized[0] ?? null
        const firstChild = firstCategory?.children[0] ?? null
        setSelectedCategoryId(firstCategory?.id ?? null)
        setSelectedChildId(firstChild?.id ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "重新加载失败")
      } finally {
        setLoading(false)
      }
    })()
  }

  if (!boundUsername) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>绑定用户名后可用</CardTitle>
          <CardDescription>绑定用户名后即可配置技术栈分类</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          请先在账户设置中绑定展示用的用户名。
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>正在加载技术栈配置</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          请稍候…
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>{error}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" /> 重新加载
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>技术栈分类设置</CardTitle>
          <CardDescription>
            自定义作品集中的技术栈分类、二级菜单，并为每个分类分配项目。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddCategory} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> 新增分类
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中…" : "保存配置"}
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> 重新加载
            </Button>
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">分类列表</CardTitle>
                <CardDescription>选择并管理技术栈分类</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">尚未创建任何分类，点击上方按钮新增。</p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => {
                      const isActive = category.id === selectedCategoryId
                      return (
                        <button
                          key={category.id}
                          className={cn(
                            "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                            isActive
                              ? "border-primary/40 bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40"
                          )}
                          onClick={() => {
                            setSelectedCategoryId(category.id)
                            setSelectedChildId(category.children[0]?.id ?? null)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              {category.label || "未命名分类"}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {category.children.length} 子分类
                            </Badge>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {selectedCategory ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">分类设置</CardTitle>
                      <CardDescription>编辑分类名称与图标</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-label">分类名称</Label>
                        <Input
                          id="category-label"
                          value={selectedCategory.label}
                          onChange={(event) =>
                            handleCategoryLabelChange(selectedCategory.id, event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-icon">图标名称（可选）</Label>
                        <Input
                          id="category-icon"
                          value={selectedCategory.icon ?? ""}
                          placeholder="例如：lucide:layers"
                          onChange={(event) =>
                            handleCategoryIconChange(selectedCategory.id, event.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteCategory(selectedCategory.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> 删除分类
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">子分类</CardTitle>
                      <CardDescription>配置二级菜单及标签</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" size="sm" onClick={() => handleAddChild(selectedCategory.id)}>
                        <Plus className="mr-2 h-4 w-4" /> 新增子分类
                      </Button>

                      {selectedCategory.children.length === 0 ? (
                        <p className="text-sm text-muted-foreground">当前分类暂无子分类。</p>
                      ) : (
                        <div className="space-y-4">
                          {selectedCategory.children.map((child) => {
                            const isActiveChild = child.id === selectedChildId
                            return (
                              <Card key={child.id} className={cn(isActiveChild && "border-primary/50")}> 
                                <CardContent className="pt-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={isActiveChild ? "default" : "secondary"}>
                                        {child.label || "未命名子分类"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {child.projectIds.length} 项目
                                      </span>
                                    </div>
                                    <div className="space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedChildId(child.id)}
                                      >
                                        设置项目
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleDeleteChild(selectedCategory.id, child.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label>子分类名称</Label>
                                      <Input
                                        value={child.label}
                                        onChange={(event) =>
                                          handleChildLabelChange(selectedCategory.id, child.id, event.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>图标名称（可选）</Label>
                                      <Input
                                        value={child.icon ?? ""}
                                        placeholder="例如：lucide:code-2"
                                        onChange={(event) =>
                                          handleChildIconChange(selectedCategory.id, child.id, event.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">项目分配</CardTitle>
                      <CardDescription>为选中的子分类分配或移除项目</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedChild ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">可选项目</h3>
                              <Badge variant="outline" className="text-xs">
                                {availableProjects.length}
                              </Badge>
                            </div>
                            <ScrollArea className="h-64 rounded-lg border">
                              <div className="p-2 space-y-1">
                                {availableProjects.map((project) => {
                                  const isSelected = selectedAvailable.includes(project.id)
                                  return (
                                    <button
                                      key={project.id}
                                      className={cn(
                                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                                        isSelected
                                          ? "bg-primary/10 text-primary"
                                          : "hover:bg-muted"
                                      )}
                                      onClick={() => {
                                        setSelectedAvailable((prev) =>
                                          prev.includes(project.id)
                                            ? prev.filter((id) => id !== project.id)
                                            : [...prev, project.id]
                                        )
                                      }}
                                    >
                                      <div className="font-medium">{project.name}</div>
                                      {project.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                          {project.description}
                                        </div>
                                      )}
                                    </button>
                                  )
                                })}
                                {availableProjects.length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-6">
                                    所有项目都已分配到该子分类。
                                  </p>
                                )}
                              </div>
                            </ScrollArea>
                            <Button
                              variant="outline"
                              onClick={handleMoveToAssigned}
                              disabled={selectedAvailable.length === 0}
                            >
                              添加到子分类
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">已分配项目</h3>
                              <Badge variant="outline" className="text-xs">
                                {assignedProjects.length}
                              </Badge>
                            </div>
                            <ScrollArea className="h-64 rounded-lg border">
                              <div className="p-2 space-y-1">
                                {assignedProjects.map((project) => {
                                  const isSelected = selectedAssigned.includes(project.id)
                                  return (
                                    <button
                                      key={project.id}
                                      className={cn(
                                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                                        isSelected
                                          ? "bg-destructive/10 text-destructive"
                                          : "hover:bg-muted"
                                      )}
                                      onClick={() => {
                                        setSelectedAssigned((prev) =>
                                          prev.includes(project.id)
                                            ? prev.filter((id) => id !== project.id)
                                            : [...prev, project.id]
                                        )
                                      }}
                                    >
                                      <div className="font-medium">{project.name}</div>
                                      {project.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                          {project.description}
                                        </div>
                                      )}
                                    </button>
                                  )
                                })}
                                {assignedProjects.length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-6">
                                    该子分类还没有关联项目。
                                  </p>
                                )}
                              </div>
                            </ScrollArea>
                            <Button
                              variant="outline"
                              onClick={handleMoveToAvailable}
                              disabled={selectedAssigned.length === 0}
                            >
                              从子分类移除
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          请先选择一个子分类以分配项目。
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-6 text-sm text-muted-foreground">
                    尚未选择分类，请先在左侧创建或选择一个分类。
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {statusToast && (
        <StatusToast status={statusToast} onClose={() => setStatusToast(null)} />
      )}
    </div>
  )
}
