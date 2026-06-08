import { SupabaseClient } from "@supabase/supabase-js";
import type { DesignType, Analysis } from "@/types/analysis";
import { ServiceFactory } from "./service-factory";
import { AnalysisRepository } from "./analysis-repository";
import { StorageService } from "./storage-service";
import { GeminiService } from "./gemini-service";
import { logger } from "@/lib/logger";
import { AuthenticationError } from "@/lib/errors/app-error";

/**
 * AnalysisUseCase handles the core business logic for design analysis
 * Orchestrates between Gemini service and data persistence
 */
export class AnalysisUseCase {
  private geminiService: GeminiService;
  private analysisRepository: AnalysisRepository;
  private storageService: StorageService;

  constructor(
    geminiService: GeminiService,
    analysisRepository: AnalysisRepository,
    storageService: StorageService
  ) {
    this.geminiService = geminiService;
    this.analysisRepository = analysisRepository;
    this.storageService = storageService;
  }

  async analyzeAndSave(
    userId: string,
    imageUrl: string,
    designType?: DesignType | null
  ): Promise<Analysis> {
    logger.debug("Starting analyze and save", { userId, imageUrl });

    // Step 1: Analyze the design
    const analysisResult = await this.geminiService.analyzeDesign(
      imageUrl,
      designType ?? undefined
    );

    // Step 2: Save to database
    const analysis = await this.analysisRepository.create({
      userId,
      imageUrl,
      designType: designType ?? null,
      analysis: analysisResult,
    });

    logger.info("Analysis saved successfully", { id: analysis.id });

    return analysis;
  }

  async getAnalysis(analysisId: string): Promise<Analysis | null> {
    return this.analysisRepository.getById(analysisId);
  }

  async getUserAnalyses(userId: string, limit?: number): Promise<Analysis[]> {
    return this.analysisRepository.getByUserId(userId, limit);
  }

  async deleteAnalysis(analysisId: string): Promise<void> {
    return this.analysisRepository.deleteById(analysisId);
  }

  static async create(client: SupabaseClient): Promise<AnalysisUseCase> {
    return new AnalysisUseCase(
      ServiceFactory.getGeminiService(),
      ServiceFactory.getAnalysisRepository(client),
      ServiceFactory.getStorageService(client)
    );
  }
}

/**
 * UploadUseCase handles design image upload and storage
 */
export class UploadUseCase {
  private storageService: StorageService;
  private client: SupabaseClient;

  constructor(storageService: StorageService, client: SupabaseClient) {
    this.storageService = storageService;
    this.client = client;
  }

  async uploadDesignImage(file: Buffer, fileName: string): Promise<string> {
    logger.debug("Starting file upload", { fileName });

    // Get current user for path construction
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user) {
      throw new AuthenticationError();
    }

    // Build storage path: user_id/timestamp.ext
    const ext = fileName.split(".").pop() || "png";
    const storagePath = `${user.id}/${Date.now()}.${ext}`;

    // Determine content type
    const contentType = this.getContentType(ext);

    // Upload to storage
    const { publicUrl } = await this.storageService.uploadImage(
      file,
      storagePath,
      contentType
    );

    logger.info("File uploaded successfully", { publicUrl });

    return publicUrl;
  }

  private getContentType(ext: string): string {
    const typeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
    };
    return typeMap[ext.toLowerCase()] || "image/png";
  }

  static async create(client: SupabaseClient): Promise<UploadUseCase> {
    return new UploadUseCase(
      ServiceFactory.getStorageService(client),
      client
    );
  }
}
