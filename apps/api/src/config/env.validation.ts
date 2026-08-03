import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  API_PUBLIC_URL: z.string().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  WEB_REVALIDATE_URL: z.string().min(1),
  REVALIDATE_SECRET: z.string().min(1),
  MAIL_DRIVER: z.enum(['log', 'resend']).default('log'),
  MAIL_FROM: z.string().default('AMTARC <no-reply@amtarc.fr>'),
  RESEND_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
