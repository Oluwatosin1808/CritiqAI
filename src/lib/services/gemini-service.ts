import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult, DesignType } from "@/types/analysis";
import { logger } from "@/lib/logger";
import { AppError, ErrorCode, ExternalServiceError } from "@/lib/errors/app-error";

const GEMINI_BASE_PROMPT = `You are a world-class product design panel.
Analyze this UI screenshot and return ONLY valid JSON.

Evaluate:
- UX clarity
- Visual hierarchy
- Accessibility
- Conversion optimization

Be extremely specific and actionable.

Return JSON ONLY in this exact structure:
{
  "overall_score": number (0-100),
  "ux_score": number (0-100),
  "visual_score": number (0-100),
  "accessibility_score": number (0-100),
  "conversion_score": number (0-100),
  "summary": string,
  "strengths": string[],
  "issues": string[],
  "recommendations": string[]
}`;

const DESIGN_TYPE_CONTEXT: Record<DesignType, string> = {
  landing_page: "This is a landing page design.",
  mobile_app: "This is a mobile app UI design.",
  dashboard: "This is a dashboard/admin interface design.",
  saas_product: "This is a SaaS product interface design.",
};

interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new AppError(
        "GEMINI_API_KEY is not configured",
        ErrorCode.INTERNAL_ERROR
      );
    }
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-2.5-flash";
    logger.debug("GeminiService initialized", { model: this.model });
  }

  async analyzeDesign(
    imageUrl: string,
    designType?: DesignType
  ): Promise<AnalysisResult> {
    try {
      logger.debug("Starting design analysis", { imageUrl, designType });

      const imageBuffer = await this.fetchImage(imageUrl);
      const contentType = await this.getImageContentType(imageUrl);
      const base64 = Buffer.from(imageBuffer).toString("base64");

      const prompt = this.buildPrompt(designType);

      const model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      logger.debug("Sending request to Gemini API", { designType });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: contentType,
            data: base64,
          },
        },
      ]);

      const text = result.response.text();
      const parsed = this.parseAnalysisResult(text);

      logger.info("Design analysis completed", {
        overallScore: parsed.overall_score,
      });

      return parsed;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Design analysis failed", error);

      if (error instanceof Error) {
        throw new ExternalServiceError("Gemini", error);
      }

      throw new AppError(
        "Design analysis failed",
        ErrorCode.ANALYSIS_FAILED
      );
    }
  }

  private async fetchImage(imageUrl: string): Promise<ArrayBuffer> {
    try {
      logger.debug("Fetching image from URL", { imageUrl });

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new AppError(
          `Failed to fetch image: ${response.statusText}`,
          ErrorCode.IMAGE_FETCH_ERROR
        );
      }

      return await response.arrayBuffer();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Image fetch failed", error);
      throw new AppError(
        "Failed to fetch image for analysis",
        ErrorCode.IMAGE_FETCH_ERROR
      );
    }
  }

  private async getImageContentType(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      return contentType || "image/png";
    } catch {
      // Fallback to PNG if HEAD request fails
      return "image/png";
    }
  }

  private buildPrompt(designType?: DesignType): string {
    const context = designType ? DESIGN_TYPE_CONTEXT[designType] : "";
    return `${GEMINI_BASE_PROMPT}\n\n${context}`;
  }

  private parseAnalysisResult(json: string): AnalysisResult {
    try {
      const parsed = JSON.parse(json);

      return {
        overall_score: this.clampScore(parsed.overall_score),
        ux_score: this.clampScore(parsed.ux_score),
        visual_score: this.clampScore(parsed.visual_score),
        accessibility_score: this.clampScore(parsed.accessibility_score),
        conversion_score: this.clampScore(parsed.conversion_score),
        summary: this.sanitizeString(parsed.summary),
        strengths: this.sanitizeArray(parsed.strengths),
        issues: this.sanitizeArray(parsed.issues),
        recommendations: this.sanitizeArray(parsed.recommendations),
      };
    } catch (error) {
      logger.error("Failed to parse analysis result", error);
      throw new AppError(
        "Invalid analysis response format",
        ErrorCode.ANALYSIS_FAILED
      );
    }
  }

  private clampScore(score: unknown): number {
    const num = typeof score === "number" ? score : 0;
    return Math.min(100, Math.max(0, Math.round(num)));
  }

  private sanitizeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  private sanitizeArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .map((item) => (item as string).trim());
  }
}

// Factory function for easy initialization
export function createGeminiService(): GeminiService {
  return new GeminiService({
    apiKey: process.env.GEMINI_API_KEY!,
  });
}
