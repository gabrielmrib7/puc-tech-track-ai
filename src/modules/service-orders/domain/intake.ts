import { z } from "zod";

export const serviceOrderInputSchema = z.object({
  customerId: z.string().uuid(),
  equipmentId: z.string().uuid(),
  estimatedCompletion: z.coerce.date().optional(),
  diagnosis: z.string().trim().min(3),
});

export type ServiceOrderInput = z.infer<typeof serviceOrderInputSchema>;
