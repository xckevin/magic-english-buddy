import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { db, createDefaultSettings, type User } from '@/db';
import { getDataStats } from '@/services/dataInitService';
import { useInitialization } from '@/hooks/useInitialization';
import { useAppStore } from '@/stores/useAppStore';

vi.mock('@/services/dataInitService', () => ({
  needsInitialization: vi.fn(() => false),
  initializeAppData: vi.fn(),
  getDataStats: vi.fn(async () => ({ stories: 90, words: 700, regions: 7, nodes: 90 })),
}));

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

const user = (id: string): User => ({
  id,
  name: id,
  buddyName: 'Buddy',
  createdAt: 1,
  lastActiveAt: 1,
  settings: createDefaultSettings(),
});

describe('useInitialization profile selection', () => {
  beforeEach(async () => {
    await Promise.all([db.users.clear(), db.learningMeta.clear()]);
    useAppStore.setState({
      currentUserId: null,
      isFirstLaunch: false,
      settings: createDefaultSettings(),
    });
    vi.mocked(getDataStats).mockResolvedValue({ stories: 90, words: 700, regions: 7, nodes: 90 });
  });

  it('keeps the persisted restored profile instead of selecting another user', async () => {
    await db.users.bulkPut([user('another-profile'), user('restored-profile')]);
    useAppStore.setState({ currentUserId: 'restored-profile' });

    const { result } = renderHook(() => useInitialization(), { wrapper });

    await waitFor(() => expect(result.current.state.isComplete).toBe(true));
    expect(useAppStore.getState().currentUserId).toBe('restored-profile');
  });

  it('prefers the authoritative selected profile over stale persisted storage', async () => {
    await db.users.bulkPut([user('stale-profile'), user('active-profile')]);
    await db.learningMeta.put({ key: 'activeProfileId', value: 'active-profile' });
    useAppStore.setState({ currentUserId: 'stale-profile' });

    const { result } = renderHook(() => useInitialization(), { wrapper });

    await waitFor(() => expect(result.current.state.isComplete).toBe(true));
    await waitFor(() => expect(useAppStore.getState().currentUserId).toBe('active-profile'));
  });

  it('falls back to an available profile when no ID was persisted', async () => {
    await db.users.put(user('available-profile'));

    const { result } = renderHook(() => useInitialization(), { wrapper });

    await waitFor(() => expect(result.current.state.isComplete).toBe(true));
    await waitFor(() => expect(useAppStore.getState().currentUserId).toBe('available-profile'));
  });

  it('falls back to an available profile when the persisted ID was deleted', async () => {
    await db.users.put(user('available-profile'));
    useAppStore.setState({ currentUserId: 'deleted-profile' });

    const { result } = renderHook(() => useInitialization(), { wrapper });

    await waitFor(() => expect(result.current.state.isComplete).toBe(true));
    await waitFor(() => expect(useAppStore.getState().currentUserId).toBe('available-profile'));
  });

  it('falls back to a persisted profile when the authoritative selected ID was deleted', async () => {
    await db.users.put(user('persisted-profile'));
    await db.learningMeta.put({ key: 'activeProfileId', value: 'deleted-profile' });
    useAppStore.setState({ currentUserId: 'persisted-profile' });

    const { result } = renderHook(() => useInitialization(), { wrapper });

    await waitFor(() => expect(result.current.state.isComplete).toBe(true));
    await waitFor(() => expect(useAppStore.getState().currentUserId).toBe('persisted-profile'));
  });

  it('does not select or navigate from a delayed check after unmount', async () => {
    await db.users.put(user('late-profile'));
    let resolveStats!: (stats: {
      stories: number;
      words: number;
      regions: number;
      nodes: number;
    }) => void;
    vi.mocked(getDataStats).mockReturnValueOnce(
      new Promise(resolve => {
        resolveStats = resolve;
      })
    );

    const { unmount } = renderHook(() => useInitialization(), { wrapper });
    unmount();
    resolveStats({ stories: 90, words: 700, regions: 7, nodes: 90 });
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(useAppStore.getState().currentUserId).toBeNull();
  });
});
