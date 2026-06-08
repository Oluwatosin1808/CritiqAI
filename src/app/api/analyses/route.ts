import { createClient } from "@/lib/supabase/server";
import { ApiResponseHandler } from "@/lib/api-response-handler";
import { AnalysisUseCase } from "@/lib/services/application-services";
import { logger } from "@/lib/logger";

/**
 * GET /api/analyses
 * Retrieves all analyses for the authenticated user
 *
 * Response:
 * - analyses: Array of analysis records with results
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("Unauthorized analyses request");
      return ApiResponseHandler.error(
        new Error("Unauthorized"),
        401
      );
    }

    logger.debug("Fetching analyses for user", { userId: user.id });

    const analysisUseCase = await AnalysisUseCase.create(supabase);
    const analyses = await analysisUseCase.getUserAnalyses(user.id);

    logger.info("Analyses retrieved", { count: analyses.length });

    return ApiResponseHandler.success({ analyses }, 200);
  } catch (error) {
    logger.error("Analyses request failed", error);
    return ApiResponseHandler.error(error);
  }
}
