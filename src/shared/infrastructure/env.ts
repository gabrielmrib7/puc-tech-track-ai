import { z } from "zod";

export const envSchema = z.object({
  PROJECT_NAME: z.string().default("tech_Track"),
  GLOBAL_PREFIX: z.string().default("api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  FRONTEND_PORT: z.coerce.number().default(3000),
  BACKEND_PORT: z.coerce.number().default(3001),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.safeParse(config);
}

