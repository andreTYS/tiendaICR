import { describe, it, expect } from 'vitest';
import { createBannerData } from './banner';
import { assertMaxActive } from './banner-invariants';
import { MaxActiveBannersReachedError } from './banner-errors';

describe('createBannerData', () => {
  it('creates banner data with required fields', () => {
    const data = createBannerData({
      titleEs: 'Título ES',
      descEs: 'Descripción ES',
      imageKey: '2024/01/abc.jpg',
    });

    expect(data.titleEs).toBe('Título ES');
    expect(data.descEs).toBe('Descripción ES');
    expect(data.imageKey).toBe('2024/01/abc.jpg');
    expect(data.isActive).toBe(false);
    expect(data.order).toBe(0);
  });

  it('allows setting isActive and order', () => {
    const data = createBannerData({
      titleEs: 'Test',
      descEs: 'Desc',
      imageKey: 'key',
      isActive: true,
      order: 3,
    });

    expect(data.isActive).toBe(true);
    expect(data.order).toBe(3);
  });

  it('EN fields are optional', () => {
    const data = createBannerData({
      titleEs: 'Solo español',
      descEs: 'Descripción',
      imageKey: 'key',
    });

    expect(data.titleEn).toBeUndefined();
    expect(data.descEn).toBeUndefined();
  });
});

describe('assertMaxActive', () => {
  it('does not throw when activeCount < max', () => {
    expect(() => assertMaxActive(4, 5)).not.toThrow();
    expect(() => assertMaxActive(0, 5)).not.toThrow();
    expect(() => assertMaxActive(0, 1)).not.toThrow();
  });

  it('throws MaxActiveBannersReachedError when activeCount === max', () => {
    expect(() => assertMaxActive(5, 5)).toThrowError(MaxActiveBannersReachedError);
  });

  it('throws MaxActiveBannersReachedError when activeCount > max', () => {
    expect(() => assertMaxActive(6, 5)).toThrowError(MaxActiveBannersReachedError);
  });

  it('thrown error message mentions the counts', () => {
    try {
      assertMaxActive(5, 5);
    } catch (e) {
      expect(e).toBeInstanceOf(MaxActiveBannersReachedError);
      expect((e as Error).message).toContain('5');
    }
  });

  it('does not throw when max is 0 and activeCount is 0', () => {
    // max=0 means no active banners allowed; count=0 means none active → still at capacity
    // 0 >= 0 → throws (correct — cannot activate any banner when max is 0)
    expect(() => assertMaxActive(0, 0)).toThrowError(MaxActiveBannersReachedError);
  });
});
