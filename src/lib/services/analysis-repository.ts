import { BaseSupabaseService } from "./base-supabase-service";
import type { Analysis, AnalysisResult, DesignType } from "@/types/analysis";
import { logger } from "@/lib/logger";
import { AppError, ErrorCode } from "@/lib/errors/app-error";

export interface CreateAnalysisInput {
  userId: string;
  imageUrl: string;
  designType: DesignType | null;
  analysis: AnalysisResult;
}

export class AnalysisRepository extends BaseSupabaseService {
  private readonly table = "analyses";

  async create(input: CreateAnalysisInput): Promise<Analysis> {
    try {
      logger.debug("Creating analysis record", { userId: input.userId });

      const { data, error } = await this.client
        .from(this.table)
        .insert({
          user_id: input.userId,
          image_url: input.imageUrl,
          design_type: input.designType,
          analysis: input.analysis,
        })
        .select("id, user_id, image_url, design_type, analysis, created_at")
        .single();

      if (error) {
        logger.error("Failed to create analysis record", error);
        throw new AppError(
          "Failed to save analysis",
          ErrorCode.DATABASE_ERROR
        );
      }

      logger.info("Analysis record created", { id: data.id });

      return data as Analysis;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }

  async getById(id: string): Promise<Analysis | null> {
    try {
      logger.debug("Fetching analysis by id", { id });

      const { data, error } = await this.client
        .from(this.table)
        .select("id, user_id, image_url, design_type, analysis, created_at")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null;
        }
        logger.error("Failed to fetch analysis", error);
        throw new AppError(
          "Failed to fetch analysis",
          ErrorCode.DATABASE_ERROR
        );
      }

      return data as Analysis;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }

  async getByUserId(userId: string, limit: number = 50): Promise<Analysis[]> {
    try {
      logger.debug("Fetching analyses for user", { userId, limit });

      const { data, error } = await this.client
        .from(this.table)
        .select("id, user_id, image_url, design_type, analysis, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        logger.error("Failed to fetch user analyses", error);
        throw new AppError(
          "Failed to fetch analyses",
          ErrorCode.DATABASE_ERROR
        );
      }

      return (data || []) as Analysis[];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      logger.debug("Deleting analysis record", { id });

      const { error } = await this.client
        .from(this.table)
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Failed to delete analysis", error);
        throw new AppError(
          "Failed to delete analysis",
          ErrorCode.DATABASE_ERROR
        );
      }

      logger.info("Analysis deleted", { id });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }
}
