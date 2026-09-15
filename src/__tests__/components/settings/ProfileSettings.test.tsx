import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '../../utils/render';
import type { User } from '@/db';
import { useAppStore } from '@/stores/useAppStore';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import {
  createLearningProfile,
  listLearningProfiles,
  switchLearningProfile,
} from '@/services/profileService';

vi.mock('@/services/profileService', () => ({
  PROFILE_NAME_MAX_LENGTH: 20,
  listLearningProfiles: vi.fn(),
  createLearningProfile: vi.fn(),
  switchLearningProfile: vi.fn(),
  renameLearningProfile: vi.fn(),
}));

vi.mock('@/components/common', () => ({
  Modal: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? children : null),
}));

const profile = (id: string, name: string): User => ({
  id,
  name,
  buddyName: `${name}的伙伴`,
  createdAt: 1,
  lastActiveAt: 1,
  settings: {
    language: 'zh-CN',
    ttsSpeed: 1.0,
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayTTS: true,
    showTranslation: false,
  },
});

const first = profile('first', '小橙子');
const second = profile('second', '小蓝莓');

describe('ProfileSettings', () => {
  beforeEach(() => {
    vi.mocked(listLearningProfiles).mockResolvedValue([first, second]);
    vi.mocked(createLearningProfile).mockReset();
    vi.mocked(switchLearningProfile).mockReset();
    useAppStore.setState({ currentUserId: first.id });
  });

  it('shows the current profile and switches only after the service resolves', async () => {
    const onProfileActivated = vi.fn();
    vi.mocked(switchLearningProfile).mockResolvedValue(second);
    render(<ProfileSettings onProfileActivated={onProfileActivated} />);

    await screen.findByText('小橙子');
    expect(screen.getByRole('button', { name: /小橙子/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /小蓝莓/ }));

    await waitFor(() => expect(switchLearningProfile).toHaveBeenCalledWith(second.id));
    expect(onProfileActivated).toHaveBeenCalledTimes(1);
  });

  it('does not submit the same profile switch twice while it is pending', async () => {
    let resolveSwitch!: (profile: User) => void;
    vi.mocked(switchLearningProfile).mockReturnValue(
      new Promise<User>(resolve => {
        resolveSwitch = resolve;
      })
    );
    render(<ProfileSettings onProfileActivated={vi.fn()} />);

    const switchButton = await screen.findByRole('button', { name: /小蓝莓/ });
    fireEvent.click(switchButton);
    fireEvent.click(switchButton);
    expect(switchLearningProfile).toHaveBeenCalledTimes(1);

    resolveSwitch(second);
    await waitFor(() => expect(switchButton).not.toBeDisabled());
  });

  it('keeps entered names visible and reports a failed create', async () => {
    vi.mocked(createLearningProfile).mockRejectedValue(new Error('存储空间不足'));
    render(<ProfileSettings onProfileActivated={vi.fn()} />);

    await screen.findByText('小橙子');
    fireEvent.click(screen.getByRole('button', { name: /新建档案/ }));
    fireEvent.change(screen.getByLabelText('学习者名字'), { target: { value: '小草莓' } });
    fireEvent.change(screen.getByLabelText('伙伴名字'), { target: { value: '星星' } });
    fireEvent.click(screen.getByRole('button', { name: '创建并开始' }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('存储空间不足');
    expect(screen.getByLabelText('学习者名字')).toHaveValue('小草莓');
    expect(createLearningProfile).toHaveBeenCalledWith('小草莓', '星星');
  });
});
