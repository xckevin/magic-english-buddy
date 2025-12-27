import { defineConfig, devices } from '@playwright/test';

/**
 * Magic English Buddy E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './e2e',
  
  // 测试文件匹配
  testMatch: '**/*.spec.ts',
  
  // 并行执行
  fullyParallel: true,
  
  // CI 环境禁止 only
  forbidOnly: !!process.env.CI,
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并发工作线程
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-results' }],
    ['json', { outputFile: 'e2e-results/results.json' }]
  ],
  
  // 全局设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000/magic-english-buddy/',
    
    // 截图策略
    screenshot: 'only-on-failure',
    
    // 视频录制
    video: 'retain-on-failure',
    
    // 追踪
    trace: 'retain-on-failure',
    
    // 视口大小 (移动端优先)
    viewport: { width: 375, height: 667 },
    
    // 模拟触摸
    hasTouch: true,
    
    // 地理位置权限
    permissions: ['microphone'],
    
    // 离线测试支持
    offline: false,
    
    // 超时
    actionTimeout: 10000,
    navigationTimeout: 30000
  },
  
  // 项目配置 (多设备测试)
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome'
      }
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12']
      }
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad (gen 7)']
      }
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'Offline Mode',
      use: {
        ...devices['Pixel 5'],
        offline: true
      }
    }
  ],
  
  // 全局超时
  timeout: 60000,
  
  // 期望超时
  expect: {
    timeout: 5000
  },
  
  // 开发服务器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/magic-english-buddy/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  
  // 输出目录
  outputDir: 'e2e-results/test-artifacts'
});

