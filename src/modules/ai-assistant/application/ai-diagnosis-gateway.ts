import { AiEstimateRequest, AiEstimateResponse } from "../domain/schemas";

export interface AiDiagnosisGateway {
  estimate(request: AiEstimateRequest): Promise<AiEstimateResponse>;
}
