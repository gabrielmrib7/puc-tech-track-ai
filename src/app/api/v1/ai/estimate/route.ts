import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/shared/infrastructure/auth/guards";
import { aiEstimateRequestSchema } from "@/modules/ai-assistant/domain/schemas";
import { GenerateAiEstimateUseCase } from "@/modules/ai-assistant/application/generate-ai-estimate";
import { GeminiAiDiagnosisProviderGateway } from "@/modules/ai-assistant/infrastructure/gemini-gateway";

const gateway = new GeminiAiDiagnosisProviderGateway();
const useCase = new GenerateAiEstimateUseCase(gateway);

export async function POST(req: NextRequest) {
  const authResult = await requireStaff(["ADMIN", "ATTENDANT", "TECHNICIAN"]);
  if ("errorResponse" in authResult && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido (JSON esperado)" },
      { status: 400 }
    );
  }

  const parseResult = aiEstimateRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Dados de requisição inválidos",
        issues: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const estimate = await useCase.execute(parseResult.data);
    return NextResponse.json(estimate, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar estimativa de IA:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar estimativa técnica" },
      { status: 500 }
    );
  }
}
