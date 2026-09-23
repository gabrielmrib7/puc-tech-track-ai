import { z } from "zod";

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  role: z.enum(["ADMIN", "ATTENDANT", "TECHNICIAN", "CUSTOMER"]).optional(),
  active: z.boolean().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
