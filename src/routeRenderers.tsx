import {useRoutes} from "react-router-dom";
import {routerRoutes, platformRouterRoutes, projectRouterRoutes} from "@/routes";

export const RenderRoutes = () => useRoutes(routerRoutes);
export const RenderPlatformRoutes = () => useRoutes(platformRouterRoutes);
export const RenderProjectRoutes = () => useRoutes(projectRouterRoutes);
