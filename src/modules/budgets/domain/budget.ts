import { z } from "zod";
import type { BudgetStatus, OrderStatus, UserRole } from "@prisma/client";

/**
 * SCHEMA LIMITATION NOTICE (Task 1.3):
 * The current database model for `budgets` (prisma/schema.prisma) defines:
 * id, service_order_id, amount, description, status (BudgetStatus), labor_cost, parts_cost, notes, created_at, updated_at.
 * Note that dedicated expiration timestamp fields (e.g. `expires_at`) or presentation tracking fields
 * are intentionally handled at the application domain layer to preserve database stability and avoid
 * unapproved database migrations.
 */

export const budgetInputSchema = z.object({
  serviceOrderId: z.string().uuid("ID de ordem de serviço inválido").optional(),
  description: z.string().trim().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  partsCost: z.coerce.number().min(0, "Custo de peças não pode ser negativo").default(0),
  laborCost: z.coerce.number().min(0, "Mão de obra não pode ser negativa").default(0),
  notes: z.string().trim().optional(),
  // Protected fields: client-supplied amount or status are rejected
  amount: z.never({ message: "O valor total é calculado exclusivamente pelo servidor" }).optional(),
  status: z.never({ message: "O status inicial do orçamento é sempre PENDING" }).optional(),
});

export const budgetUpdateSchema = z.object({
  description: z.string().trim().min(3, "Descrição deve ter pelo menos 3 caracteres").optional(),
  partsCost: z.coerce.number().min(0, "Custo de peças não pode ser negativo").optional(),
  laborCost: z.coerce.number().min(0, "Mão de obra não pode ser negativa").optional(),
  notes: z.string().trim().nullable().optional(),
  // Protected fields: cannot modify amount, status, or relations directly via PATCH
  amount: z.never({ message: "O valor total é recalculado exclusivamente pelo servidor" }).optional(),
  status: z.never({ message: "Alterações de status devem ser feitas pelas rotas de decisão" }).optional(),
  serviceOrderId: z.never({ message: "Vínculo com ordem de serviço é imutável" }).optional(),
  id: z.never({ message: "Identificador do orçamento é imutável" }).optional(),
});

export type BudgetInput = z.infer<typeof budgetInputSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;

/**
 * Calculates budget total with two decimal precision.
 * Enforces server-side derivation: total = partsCost + laborCost.
 */
export function calculateBudgetTotal(partsCost: number, laborCost: number): number {
  const parts = isNaN(partsCost) || partsCost < 0 ? 0 : partsCost;
  const labor = isNaN(laborCost) || laborCost < 0 ? 0 : laborCost;
  return Number((parts + labor).toFixed(2));
}

/**
 * Returns true if budget is in PENDING status.
 */
export function isBudgetPending(status: BudgetStatus): boolean {
  return status === "PENDING";
}

/**
 * Only PENDING budgets are mutable (can be updated or deleted).
 * Decided budgets (APPROVED, REJECTED, EXPIRED) are strictly immutable.
 */
export function canMutateBudget(status: BudgetStatus): boolean {
  return isBudgetPending(status);
}

/**
 * Validates if a budget decision (approve/reject) is permissible:
 * - Budget must be PENDING
 * - Order must be WAITING_APPROVAL
 */
export function canDecideBudget(budgetStatus: BudgetStatus, orderStatus: OrderStatus): boolean {
  return budgetStatus === "PENDING" && orderStatus === "WAITING_APPROVAL";
}

/**
 * Validates whether the role can manage budgets (technicians and administrators).
 */
export function canManageBudgets(role: UserRole | string): boolean {
  return role === "ADMIN" || role === "TECHNICIAN";
}
