import { AiDiagnosisGateway } from "../application/ai-diagnosis-gateway";
import { AiEstimateRequest, AiEstimateResponse, aiEstimateResponseSchema } from "../domain/schemas";

export class GeminiAiDiagnosisProviderGateway implements AiDiagnosisGateway {
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  async estimate(request: AiEstimateRequest): Promise<AiEstimateResponse> {
    if (this.apiKey) {
      try {
        const aiResponse = await this.callGeminiApi(request);
        if (aiResponse) {
          return aiResponse;
        }
      } catch (err) {
        console.warn("Falha ou timeout na API externa de IA. Chaveando para catálogo técnico heurístico:", err);
      }
    }

    // Fallback gracioso determinístico
    return this.resolveFromTechnicalCatalog(request);
  }

  private async callGeminiApi(request: AiEstimateRequest): Promise<AiEstimateResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const systemPrompt = `Você é um especialista em diagnóstico técnico e orçamentos para assistência técnica de eletrônicos no Brasil.
Analise os dados do equipamento e defeito relatado e responda ESTRITAMENTE em formato JSON (sem markdown, sem blocos de código):
{
  "probable_defect": "Descrição clara do provável defeito em português",
  "confidence_score": 0.85,
  "estimated_cost_min": 180.00,
  "estimated_cost_max": 350.00,
  "suggested_parts": ["Nome da peça 1", "Nome da peça 2"],
  "complexity": "LOW" | "MEDIUM" | "HIGH",
  "provider_source": "ai_generative"
}`;

    const userPrompt = `Tipo de Aparelho: ${request.equipment_type}\nMarca: ${request.brand}\nModelo: ${request.model}\nDefeito Relatado: ${request.reported_defect}`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const parsedJson = JSON.parse(rawText);
      return aiEstimateResponseSchema.parse({
        ...parsedJson,
        provider_source: "ai_generative",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private resolveFromTechnicalCatalog(request: AiEstimateRequest): AiEstimateResponse {
    const defectLower = request.reported_defect.toLowerCase();

    if (defectLower.includes("tela") || defectLower.includes("display") || defectLower.includes("touch") || defectLower.includes("vidro")) {
      return {
        probable_defect: `Avaria no módulo frontal de display do modelo ${request.model}. Possível quebra de vidro ou falha na matriz de toque.`,
        confidence_score: 0.88,
        estimated_cost_min: 220.0,
        estimated_cost_max: 580.0,
        suggested_parts: ["Módulo Frontal Display/Touch", "Adesivo de vedação perimetral"],
        complexity: "MEDIUM",
        provider_source: "technical_catalog",
      };
    }

    if (defectLower.includes("bateria") || defectLower.includes("carrega") || defectLower.includes("conector") || defectLower.includes("carga")) {
      return {
        probable_defect: `Desgaste químico da bateria ou avaria mecânica no conector de carga (dock USB/Type-C) em ${request.model}.`,
        confidence_score: 0.85,
        estimated_cost_min: 120.0,
        estimated_cost_max: 290.0,
        suggested_parts: ["Bateria de reposição original/homologada", "Subplaca / Flex de carga"],
        complexity: "LOW",
        provider_source: "technical_catalog",
      };
    }

    if (defectLower.includes("água") || defectLower.includes("molhou") || defectLower.includes("não liga") || defectLower.includes("curto")) {
      return {
        probable_defect: `Falha na malha de alimentação primária (VCC/PMIC) ou corrosão por contato com líquido no ${request.model}.`,
        confidence_score: 0.75,
        estimated_cost_min: 280.0,
        estimated_cost_max: 650.0,
        suggested_parts: ["Banho químico ultrassônico para desoxidação", "Regulador de tensão / PMIC"],
        complexity: "HIGH",
        provider_source: "technical_catalog",
      };
    }

    // Diagnóstico genérico
    return {
      probable_defect: `Análise preliminar para ${request.brand} ${request.model}: Necessário diagnóstico em bancada para investigar o sintoma "${request.reported_defect}".`,
      confidence_score: 0.7,
      estimated_cost_min: 150.0,
      estimated_cost_max: 350.0,
      suggested_parts: ["Componentes auxiliares de bancada", "Testes de calibração"],
      complexity: "MEDIUM",
      provider_source: "technical_catalog",
    };
  }
}
