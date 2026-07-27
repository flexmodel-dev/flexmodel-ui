/**
 * Monaco Editor loader 配置
 *
 * @monaco-editor/react 默认从 CDN (cdn.jsdelivr.net) 加载 Monaco Editor，
 * 在国内网络环境下首次加载非常慢（2-3MB 文件，延迟高）。
 *
 * 此文件配置 loader 使用本地 npm 包中的 Monaco，由 Vite 打包进应用，
 * 避免了 CDN 请求，大幅提升首次加载速度。
 */
import {loader} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// 使用本地 npm 包替代 CDN 加载
loader.config({monaco});

// 预加载：提前初始化 Monaco 环境，避免用户首次打开编辑器时等待
loader.init();
