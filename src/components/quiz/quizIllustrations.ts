// Legacy lesson data names image files that were never shipped. Use bundled
// Unicode illustrations for those assets; always keep the answer's text visible.
const legacyIllustrations: Record<string, string> = {
  bird_singing: '🐦🎵',
  bird_flying: '🐦🪽',
  bird_eating: '🐦🌾',
  owl: '🦉',
  rabbit: '🐰',
  bear: '🐻',
  mouse: '🐭',
  cat: '🐱',
  dog: '🐶',
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  balloons: '🎈',
  kites: '🪁',
  birds: '🐦',
};

export function getQuizEmoji(image?: string): string | undefined {
  if (!image) return undefined;
  if (/^(?:https?:|data:|\/)|\.(?:webp|png|jpg|svg|mp3|wav|ogg)$/i.test(image)) {
    const name =
      image
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') ?? '';
    return legacyIllustrations[name];
  }
  return image;
}
