import { SupabaseClient, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { AuthenticationError, ExternalServiceError } from "@/lib/errors/app-error";

export abstract class BaseSupabaseService {
  protected client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  protected async handleSupabaseError(error: unknown): Promise<never> {
    if (error instanceof Error) {
      logger.error("Supabase operation failed", error);
      throw new ExternalServiceError("Supabase", error);
    }
    throw error;
  }

  protected async getCurrentUser(): Promise<User> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();

      if (error || !user) {
        throw new AuthenticationError();
      }

      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError();
    }
  }
}
