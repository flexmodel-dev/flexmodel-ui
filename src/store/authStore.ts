import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';
import * as authService from '@/services/auth';
import type {AuthStore, UserInfo} from '@/types/auth';

// 创建认证store
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,

        // 登录方法
        login: async (username: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await authService.login({ username, password });

            set({
              isAuthenticated: true,
              user: response.user,
              token: response.token,
              isLoading: false,
              error: null
            });

            return true;
          } catch (error: any) {
            // 处理API返回的错误格式
            let errorMessage = '登录失败';

            if (error && typeof error === 'object') {
              if (error.message) {
                errorMessage = error.message;
              } else if (error.code && error.success === false) {
                // 处理 {"code":400,"success":false,"message":"Wrong username or password"} 格式
                errorMessage = error.message || '用户名或密码错误';
              }
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            set({
              isLoading: false,
              error: errorMessage
            });
            return false;
          }
        },

        // 退出登录
        logout: () => {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null
          });
        },

        // 刷新token
        refreshAuthToken: async () => {
          try {
            const response = await authService.refreshToken();

            set({
              token: response.token
            });

            return true;
          } catch {
            // 刷新失败，清除认证状态
            get().logout();
            return false;
          }
        },

        // 获取当前用户信息
        getCurrentUser: async () => {
          try {
            const res = await authService.getCurrentUser();
            set({ user: res?.user });
          } catch (error: any) {
            set({ error: error.message || '获取用户信息失败' });
          }
        },

        // 设置用户信息
        setUser: (user: UserInfo) => {
          set({ user });
        },

        // 设置token
        setToken: (token: string) => {
          set({ token });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// 导出选择器hooks
export const useAuth = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  token: state.token,
  isLoading: state.isLoading,
  error: state.error,
  login: state.login,
  logout: state.logout,
  refreshAuthToken: state.refreshAuthToken,
  getCurrentUser: state.getCurrentUser,
  setUser: state.setUser,
  setToken: state.setToken,
  clearError: state.clearError,
}));
