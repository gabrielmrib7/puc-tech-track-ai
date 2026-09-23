import { z } from "zod";

export const customerInputSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().trim().email("Formato de e-mail inválido").transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8, "O telefone deve ter pelo menos 8 dígitos"),
  document: z.string().trim().min(8, "O documento deve ter pelo menos 8 dígitos").optional(),
});

export const customerUpdateSchema = customerInputSchema.partial();

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
