const REQUIRED_KEYS = ['DATABASE_URL', 'JWT_SECRET'] as const;

export function validateEnvironment(config: Record<string, unknown>) {
  for (const key of REQUIRED_KEYS) {
    if (!config[key] || String(config[key]).trim().length === 0) {
      throw new Error(`${key} is required`);
    }
  }

  const jwtSecret = String(config.JWT_SECRET);
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return config;
}

export function toBoolean(value: string | undefined, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function toNumber(value: string | undefined, defaultValue: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function parseCsv(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
