import { describe, expect, it } from 'vitest';
import { formatBytes, formatNumber, formatCompactNumber } from './number.utils';

describe('number.utils', () => {
  describe('formatBytes', () => {
    it('returns 0 Bytes for zero input', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats kilobytes with default precision', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });
  });

  describe('formatNumber', () => {
    it('formats with locale grouping', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('formatCompactNumber', () => {
    it('returns plain number under 1000', () => {
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('formats thousands with 1 decimal when needed', () => {
      expect(formatCompactNumber(1500)).toBe('1.5k');
    });

    it('rounds and drops decimals for larger thousands', () => {
      expect(formatCompactNumber(10500)).toBe('11k');
    });

    it('formats millions with suffix', () => {
      expect(formatCompactNumber(2500000)).toBe('2.5m');
    });
  });
});
