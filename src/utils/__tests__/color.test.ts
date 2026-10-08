import { getColorFromHash } from '../color';

describe('getColorFromHash', () => {
  it('is deterministic for the same input', () => {
    expect(getColorFromHash('hugin')).toBe(getColorFromHash('hugin'));
  });

  it('returns a well-formed HSL string within the expected ranges', () => {
    const match = getColorFromHash('some-address').match(
      /^hsl\((\d+), (\d+)%, (\d+)%\)$/,
    );
    expect(match).not.toBeNull();
    const [hue, sat, light] = (match as RegExpMatchArray).slice(1).map(Number);
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
    expect(sat).toBeGreaterThanOrEqual(60);
    expect(sat).toBeLessThan(90);
    expect(light).toBeGreaterThanOrEqual(35);
    expect(light).toBeLessThan(65);
  });

  it('produces different colors for different inputs', () => {
    expect(getColorFromHash('alice')).not.toBe(getColorFromHash('bob'));
  });
});
