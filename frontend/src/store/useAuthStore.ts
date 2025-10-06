'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse, CurrentUserResponse } from '@/lib/api';
import {
  adminLogin,
  bindUsername,
  fetchCurrentUser,
  githubExchangeCode,
  githubGetAuthUrl,
} from '@/lib/api';

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as Record<string, unknown>).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return undefined;
};

export interface AuthUser extends CurrentUserResponse {
  token_type?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  pendingGithubState: string | null;
  getGithubAuthUrl: () => Promise<string>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithGithubCode: (code: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  bindUsername: (username: string) => Promise<void>;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  clearError: () => void;
  setGithubState: (state: string | null) => void;
}

function mapAuthResponse(response: AuthResponse): { token: string; user: AuthUser } {
  return {
    token: response.access_token,
    user: {
      role: response.user.role,
      auth_type: response.user.auth_type,
      github_id: response.user.github_id,
      github_username: response.user.github_username,
      bound_username: null,
      token_type: response.token_type,
    },
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      hydrated: false,
      pendingGithubState: null,
      setHydrated: (value) => set({ hydrated: value }),
      clearError: () => set({ error: null }),
      setGithubState: (state) => set({ pendingGithubState: state }),
      getGithubAuthUrl: async () => {
        try {
          const result = await githubGetAuthUrl();
          return result.auth_url;
        } catch (error) {
          const message = error instanceof Error ? error.message : '获取GitHub登录地址失败';
          set({ error: message });
          throw error;
        }
      },
      loginWithPassword: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adminLogin(username, password);
          const mapped = mapAuthResponse(result);
          set({ token: mapped.token, user: mapped.user, isLoading: false, error: null });
          await get().fetchUser();
        } catch (error) {
          const message = error instanceof Error ? error.message : '登录失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      loginWithGithubCode: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const result = await githubExchangeCode(code);
          const mapped = mapAuthResponse(result);
          set({ token: mapped.token, user: mapped.user, isLoading: false, error: null });
          await get().fetchUser();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'GitHub 登录失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await fetchCurrentUser(token);
          set((state) => ({ user: { ...state.user, ...user } as AuthUser }));
        } catch (error) {
          const message = error instanceof Error ? error.message : '获取用户信息失败';
          const status = getStatusCode(error);
          if (status === 401) {
            set({ token: null, user: null, error: message });
          } else {
            set({ error: message });
          }
          throw error;
        }
      },
      bindUsername: async (username: string) => {
        const { token } = get();
        if (!token) {
          throw new Error('未登录，无法绑定用户名');
        }

        set({ isLoading: true, error: null });
        try {
          await bindUsername(username, token);
          set((state) => ({
            user: state.user ? { ...state.user, bound_username: username } : state.user,
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : '绑定用户名失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      logout: () => {
        set({ token: null, user: null, error: null, pendingGithubState: null });
      },
    }),
    {
      name: 'panelshow-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        pendingGithubState: state.pendingGithubState,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
