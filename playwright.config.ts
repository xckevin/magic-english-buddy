import { defineConfig } from '@playwright/test';
import functional from './playwright.functional.config';

// The current UI and service worker are verified against the production build.
// Historical specs in e2e/ use obsolete selectors; keep the active suite explicit.
export default defineConfig({
  ...functional,
  testMatch: ['functional-regression.spec.ts', 'ux-mobile.spec.ts', 'offline-audio.spec.ts', 'learning-recovery.spec.ts', 'profiles-certificate.spec.ts'],
  projects: functional.projects?.map(project => ({
    ...project,
    testMatch: project.name === 'WebKit'
      ? ['functional-regression.spec.ts', 'learning-recovery.spec.ts', 'profiles-certificate.spec.ts']
      : ['functional-regression.spec.ts', 'ux-mobile.spec.ts', 'offline-audio.spec.ts', 'learning-recovery.spec.ts', 'profiles-certificate.spec.ts'],
  })),
});
