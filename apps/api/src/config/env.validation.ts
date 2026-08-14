import { z } from 'zod';

// The values shipped in .env.example are placeholders, and a deployment that
// keeps them is the realistic way this app ends up with a forgeable admin
// session or a back-office anyone can log into. Refusing to boot is the only
// check that cannot be skipped by not reading the roadmap.
const PLACEHOLDERS = new Set(['change-me', 'changeme', 'change_me', 'secret', 'password', 'admin']);

function isPlaceholder(value: string): boolean {
  return PLACEHOLDERS.has(value.trim().toLowerCase());
}

// 24 characters is what `openssl rand -base64 16` produces: 128 bits of
// entropy once encoded, which is well past brute force for an HMAC key.
const SECRET_MIN_LENGTH = 24;
const PASSWORD_MIN_LENGTH = 12;

function secret(minLength: number) {
  return z
    .string()
    .min(minLength, `must be at least ${minLength} characters — run: openssl rand -base64 32`)
    .refine((value) => !isPlaceholder(value), 'must not be left at its placeholder value');
}

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: secret(SECRET_MIN_LENGTH),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  API_PUBLIC_URL: z.string().default('http://localhost:3001'),
  // Number of reverse-proxy hops in front of the API; 0 when exposed directly.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  CORS_ORIGIN: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  // Guards the only account that can reach the back-office, so it gets the same
  // treatment as the secrets rather than just a "not empty" check.
  ADMIN_PASSWORD: secret(PASSWORD_MIN_LENGTH),
  WEB_REVALIDATE_URL: z.string().min(1),
  REVALIDATE_SECRET: secret(SECRET_MIN_LENGTH),
  MAIL_DRIVER: z.enum(['log', 'resend']).default('log'),
  MAIL_FROM: z.string().default('AMTARC <no-reply@amtarc.fr>'),
  RESEND_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
