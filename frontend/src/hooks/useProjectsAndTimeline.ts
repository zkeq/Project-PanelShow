import { useState, useEffect } from 'react';
import { fetchProjects, fetchTimeline } from '@/lib/api';
import type { Project } from '@/types/store';
import type { TimelineItem } from '@/types/timeline';

export interface ProjectsAndTimelineData {
  projects: Project[];
  timelineItems: TimelineItem[];
  loading: boolean;
  error: string | null;
}

export function useProjectsAndTimeline(username: string) {
  const [data, setData] = useState<ProjectsAndTimelineData>({
    projects: [],
    timelineItems: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 无需token的公开访问
        const token = '';

        const [projectsRes, timelineRes] = await Promise.all([
          fetchProjects(username, token),
          fetchTimeline(username, token)
        ]);

        // Sort projects by order field (ascending)
        const projectsArray = Array.isArray(projectsRes.data) ? projectsRes.data : [];

        const sortedProjects = [...projectsArray].sort((a, b) => {
          // Handle missing order field - projects without order go to the end
          const orderA = (typeof a.order === 'number' && !isNaN(a.order))
            ? a.order
            : Number.MAX_SAFE_INTEGER;
          const orderB = (typeof b.order === 'number' && !isNaN(b.order))
            ? b.order
            : Number.MAX_SAFE_INTEGER;

          return orderA - orderB;
        });

        setData({
          projects: sortedProjects,
          timelineItems: Array.isArray(timelineRes.data) ? timelineRes.data : [],
          loading: false,
          error: null
        });
      } catch (error) {
        setData({
          projects: [],
          timelineItems: [],
          loading: false,
          error: error instanceof Error ? error.message : '加载项目和时间线失败'
        });
      }
    };

    fetchData();
  }, [username]);

  return data;
}
