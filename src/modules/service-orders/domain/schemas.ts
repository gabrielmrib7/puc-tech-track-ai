import { z } from "zod";

export const serviceOrderUpdateSchema = z.object({
  customerId: z.string().uuid("ID de cliente inválido").optional(),
  equipmentId: z.string().uuid("ID de equipamento inválido").optional(),
  estimatedCompletion: z.coerce.date().nullable().optional(),
  diagnosis: z.string().trim().min(3, "Diagnóstico deve ter pelo menos 3 caracteres").optional(),
  // Protected fields explicitly rejected:
  status: z.never({ message: "Transições de status não são permitidas via PATCH genérico" }).optional(),
  orderNumber: z.never({ message: "Número da ordem é imutável" }).optional(),
  order_number: z.never({ message: "Número da ordem é imutável" }).optional(),
  budgetAmount: z.never({ message: "Orçamento deve ser manipulado pelas rotas dedicadas" }).optional(),
  budget_amount: z.never({ message: "Orçamento deve ser manipulado pelas rotas dedicadas" }).optional(),
  budgetStatus: z.never({ message: "Status de orçamento não pode ser alterado diretamente" }).optional(),
  budget_status: z.never({ message: "Status de orçamento não pode ser alterado diretamente" }).optional(),
  completedAt: z.never({ message: "Data de conclusão é gerenciada pela transição de estado" }).optional(),
  completed_at: z.never({ message: "Data de conclusão é gerenciada pela transição de estado" }).optional(),
  deliveredAt: z.never({ message: "Data de entrega é gerenciada pelo registro de entrega" }).optional(),
  delivered_at: z.never({ message: "Data de entrega é gerenciada pelo registro de entrega" }).optional(),
  createdAt: z.never().optional(),
  created_at: z.never().optional(),
});

export const serviceOrderCancelSchema = z.object({
  reason: z.string().trim().min(3, "Motivo do cancelamento deve ter pelo menos 3 caracteres").optional(),
});

export type ServiceOrderUpdateInput = z.infer<typeof serviceOrderUpdateSchema>;
export type ServiceOrderCancelInput = z.infer<typeof serviceOrderCancelSchema>;
