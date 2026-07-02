import {
  parseCsv,
  toBoolean,
  toNumber,
  validateEnvironment,
} from './env.validation';

describe('environment validation', () => {
  it('accepts required production settings', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'a-very-long-secret-value-for-production',
      }),
    ).toBeTruthy();
  });

  it('rejects missing required settings', () => {
    expect(() => validateEnvironment({ JWT_SECRET: 'a'.repeat(32) })).toThrow(
      'DATABASE_URL is required',
    );
  });

  it('rejects weak jwt secrets', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'short',
      }),
    ).toThrow('JWT_SECRET must be at least 32 characters long');
  });

  it('parses helper values', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean(undefined, true)).toBe(true);
    expect(toNumber('50', 10)).toBe(50);
    expect(toNumber('bad', 10)).toBe(10);
    expect(parseCsv('a, b,,c')).toEqual(['a', 'b', 'c']);
  });
});
