/**
 * Magic English Buddy - 路由配置
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/common/Loading';

// 懒加载页面组件
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const ReaderPage = lazy(() => import('@/pages/ReaderPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const ScrollPage = lazy(() => import('@/pages/ScrollPage'));

// 加载组件包装器
const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <Loading fullscreen message="加载中..." />
    }
  >
    {children}
  </Suspense>
);

// 路由配置
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/onboarding" replace />,
    },
    {
      path: '/onboarding',
      element: (
        <PageLoader>
          <OnboardingPage />
        </PageLoader>
      ),
    },
    {
      path: '/map',
      element: (
        <PageLoader>
          <MapPage />
        </PageLoader>
      ),
    },
    {
      path: '/reader/:storyId',
      element: (
        <PageLoader>
          <ReaderPage />
        </PageLoader>
      ),
    },
    {
      path: '/quiz/:storyId',
      element: (
        <PageLoader>
          <QuizPage />
        </PageLoader>
      ),
    },
    {
      path: '/scroll',
      element: (
        <PageLoader>
          <ScrollPage />
        </PageLoader>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/onboarding" replace />,
    },
  ],
  {
    basename: '/magic-english-buddy',
  }
);

export default router;

