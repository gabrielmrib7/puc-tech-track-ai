import { describe, it, expect, vi } from "vitest";
import { GenerateAiEstimateUseCase } from "./generate-ai-estimate";
import { AiDiagnosisGateway } from "./ai-diagnosis-gateway";
import { aiEstimateRequestSchema, aiEstimateResponseSchema } from "../domain/schemas";
import { GeminiAiDiagnosisProviderGateway } from "../infrastructure/gemini-gateway";

describe("AI Estimate Domain & UseCase Tests", () => {
  describe("aiEstimateRequestSchema", () => {
    it("validates a complete and correct request payload", () => {
      const validPayload = {
        equipment_type: "Smartphone",
        brand: "Apple",
        model: "iPhone 13",
        reported_defect: "Aparelho não carrega nem liga",
      };

      const result = aiEstimateRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects invalid payload with missing fields", () => {
      const invalidPayload = {
        equipment_type: "",
        brand: "Apple",
        model: "iPhone 13",
        reported_defect: "ab", // menos de 3 chars
      };

      const result = aiEstimateRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors).toHaveProperty("equipment_type");
        expect(result.error.flatten().fieldErrors).toHaveProperty("reported_defect");
      }
    });
  });

  describe("GenerateAiEstimateUseCase", () => {
    it("returns estimate when gateway succeeds", async () => {
      const mockGateway: AiDiagnosisGateway = {
        estimate: vi.fn().mockResolvedValue({
          probable_defect: "Falha no conector Lightning",
          confidence_score: 0.9,
          estimated_cost_min: 150.0,
          estimated_cost_max: 280.0,
          suggested_parts: ["Subplaca de carga"],
          complexity: "LOW",
          provider_source: "ai_generative",
        }),
      };

      const useCase = new GenerateAiEstimateUseCase(mockGateway);
      const result = await useCase.execute({
        equipment_type: "Smartphone",
        brand: "Apple",
        model: "iPhone 13",
        reported_defect: "Não carrega",
      });

      expect(mockGateway.estimate).toHaveBeenCalledTimes(1);
      expect(result.probable_defect).toBe("Falha no conector Lightning");
      expect(result.confidence_score).toBe(0.9);
      expect(result.complexity).toBe("LOW");
    });

    it("triggers emergency fallback when gateway times out", async () => {
      const slowGateway: AiDiagnosisGateway = {
        estimate: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  probable_defect: "Demorou demais",
                  confidence_score: 0.5,
                  estimated_cost_min: 100,
                  estimated_cost_max: 200,
                  suggested_parts: [],
                  complexity: "LOW",
                  provider_source: "ai_generative",
                });
              }, 6000);
            })
        ),
      };

      vi.useFakeTimers();

      const useCase = new GenerateAiEstimateUseCase(slowGateway, 5000);
      const executionPromise = useCase.execute({
        equipment_type: "Smartphone",
        brand: "Apple",
        model: "iPhone 13",
        reported_defect: "Não carrega",
      });

      // Avança o timer 5100ms para disparar o timeout de 5000ms
      vi.advanceTimersByTime(5100);

      const result = await executionPromise;

      expect(result.provider_source).toBe("technical_catalog");
      expect(result.complexity).toBe("MEDIUM");
      expect(result.probable_defect).toContain("iPhone 13");

      vi.useRealTimers();
    });
  });

  describe("GeminiAiDiagnosisProviderGateway (Fallback Catálogo Heurístico)", () => {
    it("returns display repair estimate for screen issues when no API key configured", async () => {
      const gateway = new GeminiAiDiagnosisProviderGateway("");

      const result = await gateway.estimate({
        equipment_type: "Smartphone",
        brand: "Samsung",
        model: "Galaxy S22",
        reported_defect: "Tela trincada e sem touch",
      });

      expect(result.provider_source).toBe("technical_catalog");
      expect(result.complexity).toBe("MEDIUM");
      expect(result.probable_defect).toContain("display");
      expect(result.suggested_parts).toContain("Módulo Frontal Display/Touch");
      expect(result.confidence_score).toBeGreaterThanOrEqual(0.8);
      expect(aiEstimateResponseSchema.safeParse(result).success).toBe(true);
    });

    it("returns battery/charge repair estimate for charging issues", async () => {
      const gateway = new GeminiAiDiagnosisProviderGateway("");

      const result = await gateway.estimate({
        equipment_type: "Smartphone",
        brand: "Motorola",
        model: "Edge 30",
        reported_defect: "Aparelho não segura carga e bateria esquenta",
      });

      expect(result.provider_source).toBe("technical_catalog");
      expect(result.complexity).toBe("LOW");
      expect(result.suggested_parts).toContain("Bateria de reposição original/homologada");
    });
  });
});
