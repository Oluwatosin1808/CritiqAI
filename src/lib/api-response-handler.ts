import { NextResponse } from "next/server";
import { AppError } from "./errors/app-error";
import { logger } from "./logger";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiResponseHandler {
  static success<T>(data: T, statusCode: number = 200): NextResponse {
    return NextResponse.json({ success: true, data }, { status: statusCode });
  }

  static error(
    error: unknown,
    defaultStatusCode: number = 500
  ): NextResponse {
    if (error instanceof AppError) {
      logger.warn(`API Error: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      logger.error(`Unexpected error: ${error.message}`, error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        },
        { status: defaultStatusCode }
      );
    }

    logger.error("Unknown error type", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: defaultStatusCode }
    );
  }
}
