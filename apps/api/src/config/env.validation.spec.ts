import { validateEnv } from './env.validation';

const VALID_SECRET = 'B0lQ2xTf7mKpR9vZ4nJhC1sW';
const VALID_PASSWORD = 'correct-horse-battery';

function env(overrides: Record<string, unknown> = {}) {
  return {
    DATABASE_URL: 'postgresql://amtarc:amtarc@localhost:5432/amtarc',
    JWT_SECRET: VALID_SECRET,
    CORS_ORIGIN: 'http://localhost:3000',
    ADMIN_EMAIL: 'admin@amtarc.fr',
    ADMIN_PASSWORD: VALID_PASSWORD,
    WEB_REVALIDATE_URL: 'http://localhost:3000/api/revalidate',
    REVALIDATE_SECRET: VALID_SECRET,
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('accepts a complete environment and applies defaults', () => {
    const parsed = validateEnv(env());

    expect(parsed.PORT).toBe(3001);
    expect(parsed.JWT_EXPIRES_IN).toBe('7d');
    expect(parsed.MAIL_DRIVER).toBe('log');
    expect(parsed.TRUST_PROXY).toBe(0);
  });

  it.each(['JWT_SECRET', 'REVALIDATE_SECRET'])('rejects a short %s', (key) => {
    expect(() => validateEnv(env({ [key]: 'too-short' }))).toThrow();
  });

  it.each(['JWT_SECRET', 'REVALIDATE_SECRET', 'ADMIN_PASSWORD'])(
    'rejects the %s placeholder from .env.example',
    (key) => {
      expect(() => validateEnv(env({ [key]: 'change-me' }))).toThrow();
    },
  );

  it('rejects a placeholder whatever its casing or padding', () => {
    expect(() => validateEnv(env({ ADMIN_PASSWORD: '  Change-Me  ' }))).toThrow();
  });

  it('rejects a short ADMIN_PASSWORD', () => {
    expect(() => validateEnv(env({ ADMIN_PASSWORD: 'admin1234' }))).toThrow();
  });
});
