import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult, DesignType } from "@/types/analysis";

const GEMINI_PROMPT = `You are a world-class product design panel.
Analyze this UI screenshot and return ONLY valid JSON.

Evaluate:
- UX clarity
- Visual hierarchy
- Accessibility
- Conversion optimization

Be extremely specific and actionable.

Return JSON ONLY.`;

const DESIGN_TYPE_CONTEXT: Record<DesignType, string> = {
  landing_page: "This is a landing page design.",
  mobile_app: "This is a mobile app UI design.",
  dashboard: "This is a dashboard/admin interface design.",
  saas_product: "This is a SaaS product interface design.",
};

export async function analyzeDesign(
  imageUrl: string,
  designType?: DesignType
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch image for analysis");
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType =
    imageResponse.headers.get("content-type") || "image/png";
  const base64 = Buffer.from(imageBuffer).toString("base64");

  const context = designType ? DESIGN_TYPE_CONTEXT[designType] : "";
  const prompt = `${GEMINI_PROMPT}\n\n${context}\n\nReturn this exact JSON structure:
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
  const parsed = JSON.parse(text) as AnalysisResult;

  return {
    overall_score: clampScore(parsed.overall_score),
    ux_score: clampScore(parsed.ux_score),
    visual_score: clampScore(parsed.visual_score),
    accessibility_score: clampScore(parsed.accessibility_score),
    conversion_score: clampScore(parsed.conversion_score),
    summary: parsed.summary || "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
  };
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}
