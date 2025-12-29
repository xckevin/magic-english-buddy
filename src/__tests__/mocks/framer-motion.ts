/**
 * Framer Motion Mock
 * 用于测试环境中模拟 framer-motion 组件
 */

import React from 'react';
import { vi } from 'vitest';

// Mock motion 组件 - 简单地渲染 HTML 元素
const createMotionComponent = (tag: keyof JSX.IntrinsicElements) => {
  return React.forwardRef<any, any>((props, ref) => {
    const {
      // 过滤掉 framer-motion 特有的 props
      initial,
      animate,
      exit,
      variants,
      transition,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      whileInView,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      dragControls,
      dragListener,
      onDragStart,
      onDrag,
      onDragEnd,
      layout,
      layoutId,
      onAnimationStart,
      onAnimationComplete,
      ...rest
    } = props;
    return React.createElement(tag, { ...rest, ref });
  });
};

export const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  img: createMotionComponent('img'),
  svg: createMotionComponent('svg'),
  path: createMotionComponent('path'),
  circle: createMotionComponent('circle'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  label: createMotionComponent('label'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
  h5: createMotionComponent('h5'),
  h6: createMotionComponent('h6'),
};

// Mock AnimatePresence
export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: string }> = ({
  children,
}) => React.createElement(React.Fragment, null, children);

// Mock useAnimation
export const useAnimation = () => ({
  start: vi.fn(),
  stop: vi.fn(),
  set: vi.fn(),
});

// Mock useMotionValue
export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: vi.fn(),
  onChange: vi.fn(() => () => {}),
});

// Mock useTransform
export const useTransform = (value: any, inputRange: number[], outputRange: any[]) => ({
  get: () => outputRange[0],
});

// Mock useSpring
export const useSpring = useMotionValue;

// Mock useCycle
export const useCycle = <T,>(...items: T[]) => {
  let currentIndex = 0;
  return [
    items[currentIndex],
    () => {
      currentIndex = (currentIndex + 1) % items.length;
    },
  ] as [T, () => void];
};

// Mock useReducedMotion
export const useReducedMotion = () => false;

// Mock useViewportScroll (deprecated but might be used)
export const useViewportScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

// Mock useScroll
export const useScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

// Mock useInView
export const useInView = () => [null, true];

// Mock LazyMotion
export const LazyMotion: React.FC<{ children: React.ReactNode; features: any }> = ({
  children,
}) => React.createElement(React.Fragment, null, children);

// Mock domAnimation
export const domAnimation = {};

// Mock domMax
export const domMax = {};

