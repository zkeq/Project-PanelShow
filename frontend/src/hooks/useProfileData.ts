import { useState, useEffect } from 'react';
import { getProfile, getUsers, getExperiences, getQuickLinks } from '@/lib/api';

export interface ProfileData {
  profile: {
    username?: string;
    name?: string;
    title?: string;
    avatar?: string;
    bio?: string;
    github_username?: string;
    github_followers?: number;
    github_following?: number;
    github_total_stars?: number;
    github_company?: string;
    github_blog?: string;
    [key: string]: unknown;
  } | null;
  users: Record<string, {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    location?: string;
    website?: string;
    githubUrl?: string;
    twitterUrl?: string;
  }> | null;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    period: string;
    responsibilities: string[];
  }> | null;
  quickLinks: Array<{
    id: string;
    name: string;
    url: string;
    icon: string;
    description: string;
  }> | null;
  loading: boolean;
  error: string | null;
}

export function useProfileData(username: string) {
  const [data, setData] = useState<ProfileData>({
    profile: null,
    users: null,
    experiences: null,
    quickLinks: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, usersRes, experiencesRes, quickLinksRes] = await Promise.all([
          getProfile(username),
          getUsers(username),
          getExperiences(username),
          getQuickLinks(username)
        ]);

        setData({
          profile: profileRes.data,
          users: usersRes.data,
          experiences: experiencesRes.data,
          quickLinks: quickLinksRes.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setData({
          profile: null,
          users: null,
          experiences: null,
          quickLinks: null,
          loading: false,
          error: error instanceof Error ? error.message : '加载数据失败'
        });
      }
    };

    fetchData();
  }, [username]);

  return data;
}
