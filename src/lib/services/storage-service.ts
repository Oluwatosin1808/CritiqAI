import { BaseSupabaseService } from "./base-supabase-service";
import { logger } from "@/lib/logger";
import { AppError, ErrorCode } from "@/lib/errors/app-error";

export interface StorageUploadResult {
  path: string;
  publicUrl: string;
}

export class StorageService extends BaseSupabaseService {
  private readonly bucket = "designs";

  async uploadImage(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    try {
      logger.debug("Uploading file to storage", { fileName, contentType });

      const { error: uploadError } = await this.client.storage
        .from(this.bucket)
        .upload(fileName, file, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        logger.error("Storage upload failed", uploadError);
        throw new AppError(
          "Failed to upload image to storage",
          ErrorCode.STORAGE_ERROR
        );
      }

      const { data } = this.client.storage
        .from(this.bucket)
        .getPublicUrl(fileName);

      logger.info("File uploaded successfully", { path: fileName });

      return {
        path: fileName,
        publicUrl: data.publicUrl,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      logger.debug("Deleting file from storage", { path });

      const { error } = await this.client.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        logger.error("Storage delete failed", error);
        throw new AppError(
          "Failed to delete image from storage",
          ErrorCode.STORAGE_ERROR
        );
      }

      logger.info("File deleted successfully", { path });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      return this.handleSupabaseError(error);
    }
  }
}
