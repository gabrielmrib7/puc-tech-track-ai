import { z } from "zod";

export const customerInputSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8),
  document: z.string().trim().min(8).optional(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
