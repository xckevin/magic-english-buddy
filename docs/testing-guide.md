# Magic English Buddy 测试指南

## 目录

1. [测试框架概述](#测试框架概述)
2. [环境准备](#环境准备)
3. [运行测试](#运行测试)
4. [测试文件结构](#测试文件结构)
5. [编写测试](#编写测试)
6. [最佳实践](#最佳实践)

---

## 测试框架概述

本项目使用以下测试框架：

| 框架 | 用途 | 配置文件 |
|------|------|----------|
| **Vitest** | 单元测试 + 组件测试 | `vitest.config.ts` |
| **React Testing Library** | React 组件测试 | - |
| **Playwright** | E2E 端到端测试 | `playwright.config.ts` |

### 测试类型说明

```
┌─────────────────────────────────────────────────────────┐
│                     测试金字塔                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ╱╲   E2E Tests                       │
│                   ╱  ╲  (Playwright)                    │
│                  ╱────╲  e2e/*.spec.ts                  │
│                 ╱      ╲                                │
│                ╱ Integr. ╲  Integration Tests           │
│               ╱   Tests   ╲ (React Testing Library)    │
│              ╱─────────────╲ __tests__/components/     │
│             ╱               ╲                           │
│            ╱   Unit Tests    ╲  Unit Tests              │
│           ╱    (Vitest)       ╲ __tests__/services/    │
│          ╱─────────────────────╲                        │
│                                                         │
│  覆盖目标：Unit 70% / Integration 20% / E2E 10%        │
└─────────────────────────────────────────────────────────┘
```

---

## 环境准备

### 1. 安装依赖

```bash
# 安装所有依赖（包括测试依赖）
pnpm install

# 安装 Playwright 浏览器
pnpm exec playwright install
```

### 2. 验证安装

```bash
# 检查 Vitest
pnpm vitest --version

# 检查 Playwright
pnpm playwright --version
```

---

## 运行测试

### 单元测试 & 组件测试 (Vitest)

```bash
# 启动测试监视模式（开发时推荐）
pnpm test

# 单次运行所有测试
pnpm test:run

# 启动 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage

# 运行特定文件
pnpm vitest src/__tests__/services/ttsService.test.ts

# 运行匹配模式的测试
pnpm vitest --grep "TTS"
```

### E2E 测试 (Playwright)

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 启动 UI 界面
pnpm test:e2e:ui

# 有头模式运行（可视化浏览器）
pnpm test:e2e:headed

# 调试模式
pnpm test:e2e:debug

# 运行特定文件
pnpm playwright test e2e/onboarding.spec.ts

# 运行特定项目（设备）
pnpm playwright test --project="Mobile Chrome"

# 生成报告
pnpm playwright show-report
```

### 运行所有测试

```bash
# 运行单元测试 + E2E 测试
pnpm test:all
```

---

## 测试文件结构

```
src/
├── __tests__/
│   ├── setup.ts                    # 测试环境设置
│   ├── mocks/
│   │   └── index.ts               # Mock 数据和服务
│   ├── utils/
│   │   └── render.tsx             # 自定义渲染工具
│   ├── services/                   # 服务层单元测试
│   │   ├── ttsService.test.ts
│   │   ├── dictionaryService.test.ts
│   │   ├── buddyService.test.ts
│   │   ├── qrSyncService.test.ts
│   │   └── achievementService.test.ts
│   └── components/                 # 组件集成测试
│       ├── common/
│       │   └── Button.test.tsx
│       ├── reader/
│       │   └── WordHighlight.test.tsx
│       ├── quiz/
│       │   └── QuizContainer.test.tsx
│       ├── buddy/
│       │   └── BuddyAvatar.test.tsx
│       └── map/
│           └── MapNode.test.tsx

e2e/
├── onboarding.spec.ts             # 新手引导测试
├── reading-flow.spec.ts           # 阅读流程测试
├── quiz-flow.spec.ts              # Quiz 流程测试
├── offline.spec.ts                # 离线功能测试
└── scroll-page.spec.ts            # 守护者卷轴测试
```

---

## 编写测试

### 单元测试示例

```typescript
// src/__tests__/services/example.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myService } from '@/services/myService';

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('myMethod', () => {
    it('应该返回正确的结果', async () => {
      const result = await myService.myMethod('input');
      
      expect(result).toBe('expected output');
    });

    it('错误输入应该抛出异常', async () => {
      await expect(myService.myMethod('')).rejects.toThrow('Invalid input');
    });
  });
});
```

### 组件测试示例

```typescript
// src/__tests__/components/MyComponent.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/render';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('应该渲染内容', () => {
    render(<MyComponent title="Hello" />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('点击应该触发回调', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E 测试示例

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('功能模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该完成某个流程', async ({ page }) => {
    // 点击按钮
    await page.getByRole('button', { name: '开始' }).click();
    
    // 等待元素出现
    await expect(page.getByTestId('result')).toBeVisible();
    
    // 验证内容
    await expect(page.getByTestId('result')).toContainText('成功');
  });
});
```

---

## 最佳实践

### 1. 测试命名规范

```typescript
// ✅ 好的命名
describe('ButtonComponent', () => {
  it('应该渲染主要按钮样式', () => {});
  it('禁用状态不应该响应点击', () => {});
  it('加载时应该显示 loading 图标', () => {});
});

// ❌ 不好的命名
describe('Button', () => {
  it('test 1', () => {});
  it('works', () => {});
});
```

### 2. 使用 data-testid

```tsx
// 组件中添加 testid
<button data-testid="submit-button">提交</button>

// 测试中使用
screen.getByTestId('submit-button');
```

### 3. 避免测试实现细节

```typescript
// ✅ 测试行为
it('提交表单后应该显示成功消息', async () => {
  await user.type(screen.getByLabelText('名字'), 'John');
  await user.click(screen.getByRole('button', { name: '提交' }));
  
  expect(screen.getByText('提交成功')).toBeInTheDocument();
});

// ❌ 测试实现
it('应该调用 setState', () => {
  // 不要测试内部状态
});
```

### 4. Mock 外部依赖

```typescript
// 在 setup.ts 或测试文件中
vi.mock('@/services/apiService', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' })
}));
```

### 5. E2E 测试稳定性

```typescript
// 使用显式等待
await expect(page.getByTestId('loading')).not.toBeVisible({ timeout: 10000 });

// 使用 waitFor
await page.waitForSelector('[data-testid="result"]');

// 避免硬编码等待
// ❌ await page.waitForTimeout(5000);
```

---

## 常见问题

### Q: 测试运行很慢？

A: 
1. 使用 `--pool forks` 并行运行
2. 减少不必要的 beforeEach 操作
3. 使用 Mock 替代真实 API 调用

### Q: E2E 测试不稳定？

A:
1. 增加超时时间
2. 使用显式等待而非固定延时
3. 确保测试数据隔离

### Q: 如何调试失败的测试？

A:
```bash
# Vitest 调试
pnpm vitest --reporter=verbose

# Playwright 调试
pnpm playwright test --debug

# 生成调试追踪
pnpm playwright test --trace on
```

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
```

---

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright 文档](https://playwright.dev/docs/intro)
- [测试用例文档](./test-cases.md)

---

**最后更新**: 2025-12-27

