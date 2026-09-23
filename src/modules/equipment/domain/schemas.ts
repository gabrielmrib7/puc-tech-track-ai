import { z } from "zod";

export const equipmentInputSchema = z.object({
  customerId: z.string().uuid("ID de cliente inválido"),
  type: z.string().trim().min(2, "Tipo deve ter pelo menos 2 caracteres"),
  brand: z.string().trim().min(2, "Marca deve ter pelo menos 2 caracteres"),
  model: z.string().trim().min(1, "Modelo é obrigatório"),
  serialNumber: z
    .string()
    .trim()
    .min(3, "Número de série deve ter pelo menos 3 caracteres")
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined)),
  reportedProblem: z.string().trim().min(3, "Problema relatado deve ter pelo menos 3 caracteres"),
  accessories: z.string().trim().optional(),
});

export const equipmentUpdateSchema = equipmentInputSchema.partial();

export type EquipmentInput = z.infer<typeof equipmentInputSchema>;
export type EquipmentUpdateInput = z.infer<typeof equipmentUpdateSchema>;
