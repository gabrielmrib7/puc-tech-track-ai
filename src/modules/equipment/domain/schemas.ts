import { z } from "zod";

export const equipmentInputSchema = z.object({
  customerId: z.string().uuid(),
  type: z.string().trim().min(2),
  brand: z.string().trim().min(2),
  model: z.string().trim().min(1),
  serialNumber: z.string().trim().min(3).optional(),
  reportedProblem: z.string().trim().min(3),
  accessories: z.string().trim().optional(),
});

export type EquipmentInput = z.infer<typeof equipmentInputSchema>;
