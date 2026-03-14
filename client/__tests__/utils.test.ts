import { describe, it, expect } from 'vitest';

// Sample utility function to test
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

describe('Utility Functions', () => {
  it('should format dates correctly', () => {
    const date = new Date('2026-03-13');
    expect(formatDate(date)).toBe('March 13, 2026');
  });

  it('should truncate long strings', () => {
    const str = 'This is a very long string that needs truncation';
    expect(truncate(str, 10)).toBe('This is a ...');
  });

  it('should not truncate short strings', () => {
    const str = 'Short';
    expect(truncate(str, 10)).toBe('Short');
  });
});
