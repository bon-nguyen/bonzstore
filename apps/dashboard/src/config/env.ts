import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000/api'),
});

const parsed = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

export const env = {
  API_URL: parsed.success ? parsed.data.VITE_API_URL : 'http://localhost:4000/api',
};

