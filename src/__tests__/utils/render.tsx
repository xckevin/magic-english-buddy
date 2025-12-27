/**
 * 自定义渲染工具
 * 包含所有必要的 Provider
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 所有 Provider 的包装器
interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// 自定义渲染函数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, {
    wrapper: AllProviders,
    ...options
  });
};

// 重新导出所有 testing-library 工具
export * from '@testing-library/react';
export { customRender as render };

// 额外的测试工具
export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
  }, { timeout: 5000 });
};

// 触摸事件模拟
export const createTouchEvent = (
  type: 'touchstart' | 'touchmove' | 'touchend',
  element: Element,
  options: { clientX?: number; clientY?: number } = {}
) => {
  const touch = new Touch({
    identifier: Date.now(),
    target: element,
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
    pageX: options.clientX ?? 0,
    pageY: options.clientY ?? 0,
    screenX: options.clientX ?? 0,
    screenY: options.clientY ?? 0,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1
  });

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: type === 'touchend' ? [] : [touch],
    targetTouches: type === 'touchend' ? [] : [touch],
    changedTouches: [touch]
  });
};

// 长按模拟
export const simulateLongPress = async (
  element: Element,
  duration: number = 500
) => {
  const { act } = await import('@testing-library/react');
  
  await act(async () => {
    element.dispatchEvent(createTouchEvent('touchstart', element, { clientX: 0, clientY: 0 }));
    await new Promise((resolve) => setTimeout(resolve, duration));
    element.dispatchEvent(createTouchEvent('touchend', element, { clientX: 0, clientY: 0 }));
  });
};

// 拖拽模拟
export const simulateDragAndDrop = async (
  source: Element,
  target: Element
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  const dataTransfer = {
    data: {} as Record<string, string>,
    setData: function(key: string, val: string) { this.data[key] = val; },
    getData: function(key: string) { return this.data[key]; },
    dropEffect: 'move',
    effectAllowed: 'all'
  };

  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragEnter(target, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
};

