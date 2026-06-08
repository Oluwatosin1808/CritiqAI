import { createClient } from "@/lib/supabase/server";
import { RequestValidator } from "@/lib/validators";
import { ApiResponseHandler } from "@/lib/api-response-handler";
import { UploadUseCase } from "@/lib/services/application-services";
import { logger } from "@/lib/logger";

/**
 * POST /api/upload
 * Uploads a design image to storage
 *
 * Request:
 * - multipart/form-data with 'file' field
 * - Supported formats: PNG, JPG, WEBP (max 10MB)
 *
 * Response:
 * - imageUrl: Public URL of the uploaded image
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn("Unauthorized upload request");
      return ApiResponseHandler.error(
        new Error("Unauthorized"),
        401
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return ApiResponseHandler.error(
        new Error("No file provided"),
        400
      );
    }

    // Validate file
    RequestValidator.validateUploadRequest(file);

    logger.debug("Processing file upload", {
      userId: user.id,
      fileName: file.name,
      size: file.size,
    });

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Use the upload use case
    const uploadUseCase = await UploadUseCase.create(supabase);
    const imageUrl = await uploadUseCase.uploadDesignImage(
      buffer,
      file.name
    );

    return ApiResponseHandler.success({ imageUrl }, 200);
  } catch (error) {
    logger.error("Upload request failed", error);
    return ApiResponseHandler.error(error);
  }
}
