/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 设置文件
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // 包含的测试文件
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/__tests__/**/*.{test,spec}.{ts,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'e2e/**/*'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/services/**/*.ts',
        'src/components/**/*.tsx',
        'src/hooks/**/*.ts',
        'src/stores/**/*.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}'
      ],
      // 覆盖率阈值
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    },
    
    // 超时设置
    testTimeout: 10000,
    
    // Mock 配置
    mockReset: true,
    restoreMocks: true,
    
    // 并发
    pool: 'forks',
    
    // 报告
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

