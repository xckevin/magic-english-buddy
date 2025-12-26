/**
 * Magic English Buddy - App 根组件
 * 可用于包裹全局 Provider
 */

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

const App: React.FC = () => {
  const setOffline = useAppStore((state) => state.setOffline);

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  return <Outlet />;
};

export default App;

