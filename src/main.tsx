import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import "./utils/monaco-loader"; // 预加载 Monaco Editor（使用本地包替代 CDN）
import "./i18n";
import "./assets/css/fonts.css";
import "./theme/designSystem.css";
import "./assets/css/tailwind.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
