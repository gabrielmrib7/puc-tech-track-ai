import { AiDiagnosisGateway } from "./ai-diagnosis-gateway";
import { AiEstimateRequest, AiEstimateResponse, aiEstimateRequestSchema } from "../domain/schemas";

export class GenerateAiEstimateUseCase {
  constructor(
    private readonly gateway: AiDiagnosisGateway,
    private readonly timeoutMs: number = 7000
  ) {}

  async execute(rawRequest: unknown): Promise<AiEstimateResponse> {
    const validatedRequest = aiEstimateRequestSchema.parse(rawRequest);

    // Timeout defensivo com Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("AI_PROVIDER_TIMEOUT"));
      }, this.timeoutMs);

      // Previne que o timer mantenha o event loop aberto em testes
      if (typeof timer.unref === "function") {
        timer.unref();
      }
    });

    try {
      return await Promise.race([
        this.gateway.estimate(validatedRequest),
        timeoutPromise,
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === "AI_PROVIDER_TIMEOUT") {
        // Fallback defensivo em timeout caso o gateway não tenha capturado
        return this.buildEmergencyFallback(validatedRequest);
      }
      throw error;
    }
  }

  private buildEmergencyFallback(request: AiEstimateRequest): AiEstimateResponse {
    return {
      probable_defect: `Diagnóstico preliminar para ${request.model}: Necessária inspeção física do circuito e componentes relacionados ao sintoma "${request.reported_defect}".`,
      confidence_score: 0.6,
      estimated_cost_min: 150.0,
      estimated_cost_max: 350.0,
      suggested_parts: ["Inspeção de conexões internas", "Verificação da placa mãe"],
      complexity: "MEDIUM",
      provider_source: "technical_catalog",
    };
  }
}
