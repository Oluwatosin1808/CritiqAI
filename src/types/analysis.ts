export interface AnalysisResult {
  overall_score: number;
  ux_score: number;
  visual_score: number;
  accessibility_score: number;
  conversion_score: number;
  summary: string;
  strengths: string[];
  issues: string[];
  recommendations: string[];
}

export type DesignType =
  | "landing_page"
  | "mobile_app"
  | "dashboard"
  | "saas_product";

export interface Analysis {
  id: string;
  user_id: string;
  image_url: string;
  design_type: DesignType | null;
  analysis: AnalysisResult;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}
