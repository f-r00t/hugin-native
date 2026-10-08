import { prettyPrintDate } from '../date';

describe('prettyPrintDate', () => {
  it('formats a valid timestamp as a non-empty string', () => {
    const out = prettyPrintDate(Date.UTC(2021, 5, 15, 12, 0, 0));
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    expect(out).toContain('2021');
  });

  it('does not throw on an invalid timestamp and falls back gracefully', () => {
    expect(() => prettyPrintDate(Number.NaN)).not.toThrow();
    expect(typeof prettyPrintDate(Number.NaN)).toBe('string');
  });
});
