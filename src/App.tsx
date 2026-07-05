import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {App as AntdApp, ConfigProvider} from "antd";
import PlatformLayout from "./components/layouts/PlatformLayout";
import ProjectLayout from "./components/layouts/ProjectLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import {useEffect, useMemo} from "react";
import * as appStore from "./store/appStore.ts";
import {useAuth} from "./store/authStore.ts";
import {initializeDarkMode} from "./utils/darkMode.ts";
import {RenderProjectRoutes} from "./routes";
import Project from "./pages/Project/index.tsx";
import Settings from "./pages/Settings";
import ApiKeys from "./pages/ApiKeys";
import Member from "./pages/Member/index.tsx";
import {antdDarkTheme as darkTheme, antdTheme as lightTheme} from "./theme/designTokens.ts";

const App = () => {
  const { fetchConfig } = appStore.useConfig();
  const { isDark } = appStore.useTheme();
  const { locale } = appStore.useLocale();
  const { isAuthenticated, getCurrentUser, refreshAuthToken } = useAuth();

  useEffect(() => {
    initializeDarkMode();
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated) {
        try {
          await getCurrentUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, getCurrentUser]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshAuthToken().catch(error => {
          console.error('Failed to refresh token:', error);
        });
      }, 15 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshAuthToken]);

  const theme = useMemo(() => {
    if (isDark) {
      return { ...darkTheme };
    }
    return lightTheme;
  }, [isDark]);

  return (
    <ConfigProvider
      locale={locale}
      theme={theme}
    >
      <AntdApp>
        <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Navigate to="/project" replace />} />

          <Route path="/project" element={
            <ProtectedRoute>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Project />} />
          </Route>

          <Route path="/member" element={
            <ProtectedRoute>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Member />} />
          </Route>

          <Route path="/api-keys" element={
            <ProtectedRoute>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ApiKeys />} />
          </Route>

          <Route path="/settings" element={
            <ProtectedRoute>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Settings />} />
          </Route>

          <Route path="/project/:projectId/*" element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
          }>
            <Route path="*" element={<RenderProjectRoutes />} />
          </Route>

          {/* <Route path="/*" element={
            <ProtectedRoute>
              <PageLayout/>
            </ProtectedRoute>
          } /> */}
        </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
