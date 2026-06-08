import { createClient } from "@/lib/supabase/server";
import { RequestValidator } from "@/lib/validators";
import { ApiResponseHandler } from "@/lib/api-response-handler";
import { AnalysisUseCase } from "@/lib/services/application-services";
import { logger } from "@/lib/logger";

/**
 * POST /api/analyze
 * Analyzes a design image using Gemini and saves the results
 *
 * Request body:
 * - imageUrl (string): URL of the design image to analyze
 * - designType (optional): Type of design (landing_page, mobile_app, dashboard, saas_product)
 *
 * Response:
 * - id: Analysis record ID
 * - analysis: Analysis results with scores and feedback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, designType } = RequestValidator.validateAnalyzeRequest(
      body
    );

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("Unauthorized analyze request");
      return ApiResponseHandler.error(
        new Error("Unauthorized"),
        401
      );
    }

    logger.debug("Processing analyze request", {
      userId: user.id,
      designType,
    });

    // Use the analysis use case to orchestrate business logic
    const analysisUseCase = await AnalysisUseCase.create(supabase);
    const analysis = await analysisUseCase.analyzeAndSave(
      user.id,
      imageUrl,
      designType
    );

    return ApiResponseHandler.success(
      { id: analysis.id, analysis: analysis.analysis },
      200
    );
  } catch (error) {
    logger.error("Analyze request failed", error);
    return ApiResponseHandler.error(error);
  }
}
