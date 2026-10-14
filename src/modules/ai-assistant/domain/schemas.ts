import { z } from "zod";

export const aiEstimateRequestSchema = z.object({
  equipment_type: z.string().min(1, "Tipo do equipamento é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  reported_defect: z.string().min(3, "Defeito relatado deve ter pelo menos 3 caracteres"),
});

export type AiEstimateRequest = z.infer<typeof aiEstimateRequestSchema>;

export const complexityLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type ComplexityLevel = z.infer<typeof complexityLevelSchema>;

export const aiEstimateResponseSchema = z.object({
  probable_defect: z.string().min(1),
  confidence_score: z.number().min(0).max(1),
  estimated_cost_min: z.number().min(0),
  estimated_cost_max: z.number().min(0),
  suggested_parts: z.array(z.string()),
  complexity: complexityLevelSchema,
  provider_source: z.enum(["ai_generative", "technical_catalog"]).default("ai_generative"),
});

export type AiEstimateResponse = z.infer<typeof aiEstimateResponseSchema>;
