import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, _clearBuckets } from './rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    _clearBuckets();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first 5 calls from the same key', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('192.168.1.1').allowed).toBe(true);
    }
  });

  it('blocks the 6th call within the same window', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('192.168.1.1');
    expect(checkRateLimit('192.168.1.1').allowed).toBe(false);
  });

  it('does not affect a different key', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('192.168.1.1');
    expect(checkRateLimit('10.0.0.1').allowed).toBe(true);
  });

  it('returns remaining count correctly', () => {
    const first = checkRateLimit('1.2.3.4');
    expect(first.remaining).toBe(4);
    const second = checkRateLimit('1.2.3.4');
    expect(second.remaining).toBe(3);
  });

  it('refills tokens after the window expires', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('192.168.1.1');
    expect(checkRateLimit('192.168.1.1').allowed).toBe(false);

    // Advance 61 seconds past the window
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit('192.168.1.1').allowed).toBe(true);
  });

  it('returns resetInMs within the 60s window', () => {
    vi.advanceTimersByTime(30_000); // 30s into life
    checkRateLimit('test-key');
    const result = checkRateLimit('test-key');
    // resetInMs should be around 30s (we advanced 30s, window is 60s)
    expect(result.resetInMs).toBeLessThanOrEqual(60_000);
    expect(result.resetInMs).toBeGreaterThan(0);
  });
});
