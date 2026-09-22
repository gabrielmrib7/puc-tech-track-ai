import { z } from "zod";

export const budgetInputSchema = z.object({
  serviceOrderId: z.string().uuid(),
  description: z.string().trim().min(3),
  partsCost: z.coerce.number().nonnegative().default(0),
  laborCost: z.coerce.number().nonnegative().default(0),
  notes: z.string().trim().optional(),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;

export function calculateBudgetTotal(partsCost: number, laborCost: number) {
  return Number((partsCost + laborCost).toFixed(2));
}
