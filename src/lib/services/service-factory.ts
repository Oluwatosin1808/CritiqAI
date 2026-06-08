import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeminiService } from "./gemini-service";
import { StorageService } from "./storage-service";
import { AnalysisRepository } from "./analysis-repository";

/**
 * ServiceFactory creates and manages all application services
 * Provides centralized service instantiation with dependency injection
 */
export class ServiceFactory {
  private static geminisInstance: GeminiService | null = null;

  static getGeminiService(): GeminiService {
    if (!this.geminisInstance) {
      this.geminisInstance = new GeminiService({
        apiKey: process.env.GEMINI_API_KEY!,
      });
    }
    return this.geminisInstance;
  }

  static getStorageService(client: SupabaseClient): StorageService {
    return new StorageService(client);
  }

  static getAnalysisRepository(client: SupabaseClient): AnalysisRepository {
    return new AnalysisRepository(client);
  }

  static async getAdminServices() {
    const adminClient = createAdminClient();
    return {
      storage: this.getStorageService(adminClient),
      analysis: this.getAnalysisRepository(adminClient),
    };
  }

  static async getUserServices() {
    const userClient = await createServerClient();
    return {
      storage: this.getStorageService(userClient),
      analysis: this.getAnalysisRepository(userClient),
    };
  }
}
