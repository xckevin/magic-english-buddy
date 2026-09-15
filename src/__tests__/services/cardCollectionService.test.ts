import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, type UserVocabulary } from '@/db';
import { convertToCard } from '@/services/cardCollectionService';

const userId = 'card-user';

describe('cardCollectionService', () => {
  beforeEach(async () => {
    await db.userVocabulary.clear();
  });

  afterEach(async () => {
    await db.userVocabulary.clear();
  });

  it('keeps an existing card unchanged when the child taps save repeatedly', async () => {
    await convertToCard(userId, 'Apple', '苹果', '🍎');
    const first = await db.userVocabulary.get(`${userId}_apple`);

    const repeated = await convertToCard(userId, 'apple', '苹果', '🍎');
    const saved = await db.userVocabulary.get(`${userId}_apple`);

    expect(saved).toMatchObject({
      firstSeen: first?.firstSeen,
      lastReviewed: first?.lastReviewed,
      correctCount: first?.correctCount,
      wrongCount: first?.wrongCount,
      masteryLevel: first?.masteryLevel,
      cardRarity: first?.cardRarity,
    });
    expect(repeated).toMatchObject({
      masteryLevel: first?.masteryLevel,
      obtainedAt: first?.firstSeen,
    });
  });

  it('serializes concurrent save taps into one card without a duplicate write', async () => {
    const results = await Promise.all([
      convertToCard(userId, 'planet', '行星', '🪐'),
      convertToCard(userId, 'planet', '行星', '🪐'),
    ]);

    expect(results[0]?.id).toBe(`${userId}_planet`);
    expect(results[1]?.id).toBe(`${userId}_planet`);
    expect(await db.userVocabulary.where('userId').equals(userId).count()).toBe(1);
  });

  it('upgrades an existing ordinary vocabulary record without losing learning data', async () => {
    const ordinaryVocabulary: UserVocabulary = {
      id: `${userId}_river`,
      userId,
      word: 'river',
      firstSeen: 100,
      lastReviewed: 200,
      correctCount: 7,
      wrongCount: 3,
      masteryLevel: 2,
      nextReviewDate: '2030-01-02',
      isCard: false,
      cardRarity: null,
    };
    await db.userVocabulary.add(ordinaryVocabulary);

    const card = await convertToCard(userId, 'river', '河流', '🏞️');
    const saved = await db.userVocabulary.get(ordinaryVocabulary.id);

    expect(card).toMatchObject({ masteryLevel: 2, obtainedAt: 100, isNew: true });
    expect(saved).toMatchObject({
      ...ordinaryVocabulary,
      isCard: true,
      cardRarity: card?.rarity,
    });
  });
});
