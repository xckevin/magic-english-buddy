/**
 * Magic English Buddy - 应用入口
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// 全局样式
import './styles/global.css';

// 初始化网络状态监听
const initNetworkListener = () => {
  const updateOnlineStatus = () => {
    const isOffline = !navigator.onLine;
    document.body.classList.toggle('offline', isOffline);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
};

// 初始化
initNetworkListener();

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </React.StrictMode>
);

// vite-plugin-pwa injects the production service-worker registration.
