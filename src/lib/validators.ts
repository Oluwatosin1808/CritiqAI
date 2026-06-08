import { ValidationError } from "./errors/app-error";
import type { DesignType } from "@/types/analysis";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_DESIGN_TYPES: DesignType[] = [
  "landing_page",
  "mobile_app",
  "dashboard",
  "saas_product",
];

export interface AnalyzeRequestDTO {
  imageUrl: string;
  designType?: DesignType | null;
}

export interface UploadRequestDTO {
  file: File;
}

export class RequestValidator {
  static validateAnalyzeRequest(data: unknown): AnalyzeRequestDTO {
    if (!data || typeof data !== "object") {
      throw new ValidationError("Request body must be an object");
    }

    const body = data as Record<string, unknown>;
    const imageUrl = body.imageUrl;
    const designType = body.designType;

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new ValidationError("imageUrl is required and must be a string");
    }

    if (
      !imageUrl.startsWith("http://") &&
      !imageUrl.startsWith("https://")
    ) {
      throw new ValidationError("imageUrl must be a valid HTTP(S) URL");
    }

    if (
      designType &&
      !ACCEPTED_DESIGN_TYPES.includes(designType as DesignType)
    ) {
      throw new ValidationError(
        `designType must be one of: ${ACCEPTED_DESIGN_TYPES.join(", ")}`
      );
    }

    return {
      imageUrl,
      designType: designType as DesignType | undefined | null,
    };
  }

  static validateUploadRequest(file: File): UploadRequestDTO {
    if (!file) {
      throw new ValidationError("No file provided");
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new ValidationError(
        `Invalid file type. Accepted types: ${ACCEPTED_IMAGE_TYPES.join(", ")}`
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new ValidationError(
        `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`
      );
    }

    return { file };
  }
}
