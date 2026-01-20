import {HashRouter, Route, Routes, Navigate} from "react-router-dom";
import {ConfigProvider, theme as antdTheme} from "antd";
import PlatformLayout from "./components/layouts/PlatformLayout";
import ProjectLayout from "./components/layouts/ProjectLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import {useEffect} from "react";
import * as appStore from "./store/appStore.ts";
import {useAuth} from "./store/authStore.ts";
import {initializeDarkMode} from "./utils/darkMode.ts";
import {RenderProjectRoutes} from "./routes";
import Project from "./pages/Project/index.tsx";
import Settings from "./pages/Settings";
import Member from "./pages/Member/index.tsx";

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

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm] : [antdTheme.compactAlgorithm],
        // algorithm: isDark ? [antdTheme.darkAlgorithm] : [],

      }}
    >
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
