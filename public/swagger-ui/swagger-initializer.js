window.onload = function() {
  //<editor-fold desc="Changeable Configuration Block">

  // 获取 OpenAPI JSON 的 URL
  function getOpenApiUrl() {
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      return `/api/f/docs/${tenantId}/openapi.json`;
    }
    return '/api/f/docs/openapi.json';
  }

  // 获取URL参数中的主题设置
  function getThemeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('theme') || 'light';
  }

  // 应用主题样式
  function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  // 应用主题
  const theme = getThemeFromUrl();
  applyTheme(theme);

  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
  window.ui = SwaggerUIBundle({
    url: getOpenApiUrl(),
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      /*SwaggerUIStandalonePreset*/
    ],
   /* plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"*/
  });

  //</editor-fold>
};
