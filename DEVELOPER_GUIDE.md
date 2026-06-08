# Developer Guide: Using the New Service Architecture

## Quick Start

### Import Services

```typescript
import { ServiceFactory, AnalysisUseCase, UploadUseCase } from "@/lib/services";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
```

### Use in API Routes

```typescript
export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    // 2. Validate request
    const body = await request.json();
    const validated = RequestValidator.validateAnalyzeRequest(body);

    // 3. Create use case
    const useCase = await AnalysisUseCase.create(supabase);

    // 4. Execute business logic
    const result = await useCase.analyzeAndSave(
      user.id,
      validated.imageUrl,
      validated.designType
    );

    // 5. Return response
    return ApiResponseHandler.success(result);
  } catch (error) {
    logger.error("Request failed", error);
    return ApiResponseHandler.error(error);
  }
}
```

## Common Patterns

### Pattern 1: Direct Service Usage

Use domain services directly when you need specific functionality:

```typescript
// Use Gemini service for design analysis
const geminiService = ServiceFactory.getGeminiService();
const analysis = await geminiService.analyzeDesign(imageUrl, "landing_page");

// Use Storage service for file operations
const storage = ServiceFactory.getStorageService(supabaseClient);
const { publicUrl } = await storage.uploadImage(buffer, fileName, contentType);
```

### Pattern 2: Use Cases for Workflows

Use cases orchestrate multiple services for complete workflows:

```typescript
// Single method handles entire analysis flow
const analysisUseCase = await AnalysisUseCase.create(supabase);
const result = await analysisUseCase.analyzeAndSave(
  userId,
  imageUrl,
  designType
);
```

### Pattern 3: Repository for Data Access

Use repositories for database operations:

```typescript
const repo = new AnalysisRepository(supabaseClient);

// Create
const analysis = await repo.create({
  userId: user.id,
  imageUrl,
  designType,
  analysis: result
});

// Read
const singleAnalysis = await repo.getById(analysisId);
const userAnalyses = await repo.getByUserId(userId);

// Delete
await repo.deleteById(analysisId);
```

### Pattern 4: Error Handling

Use domain-specific error classes:

```typescript
try {
  if (!imageUrl) throw new ValidationError("imageUrl is required");
  if (!user) throw new AuthenticationError();
  
  const result = await geminiService.analyzeDesign(imageUrl);
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn("Validation failed", { error });
    // Return 422 Unprocessable Entity
  } else if (error instanceof AuthenticationError) {
    logger.warn("Auth failed");
    // Return 401 Unauthorized
  } else if (error instanceof ExternalServiceError) {
    logger.error("External service failed", error);
    // Return 502 Bad Gateway
  } else {
    logger.error("Unexpected error", error);
    // Return 500 Internal Server Error
  }
  return ApiResponseHandler.error(error);
}
```

## Real-World Examples

### Example 1: Complete Analysis Flow

```typescript
// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { RequestValidator, ApiResponseHandler, AnalysisUseCase, logger } from "@/lib";

export async function POST(request: Request) {
  try {
    // Step 1: Parse and validate
    const body = await request.json();
    const { imageUrl, designType } = RequestValidator.validateAnalyzeRequest(body);
    
    logger.debug("Analyze request", { imageUrl, designType });

    // Step 2: Authenticate
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    // Step 3: Execute analysis
    const useCase = await AnalysisUseCase.create(supabase);
    const analysis = await useCase.analyzeAndSave(user.id, imageUrl, designType);

    logger.info("Analysis completed", { id: analysis.id });

    // Step 4: Return success
    return ApiResponseHandler.success({
      id: analysis.id,
      analysis: analysis.analysis
    });
  } catch (error) {
    logger.error("Analyze failed", error);
    return ApiResponseHandler.error(error);
  }
}
```

### Example 2: File Upload with Storage

```typescript
// src/app/api/upload/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { RequestValidator, ApiResponseHandler, UploadUseCase, logger } from "@/lib";

export async function POST(request: Request) {
  try {
    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file
    RequestValidator.validateUploadRequest(file);
    logger.debug("Uploading file", { name: file.name, size: file.size });

    // Authenticate
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    // Upload
    const uploadUseCase = await UploadUseCase.create(supabase);
    const imageUrl = await uploadUseCase.uploadDesignImage(
      Buffer.from(await file.arrayBuffer()),
      file.name
    );

    logger.info("File uploaded", { url: imageUrl });

    return ApiResponseHandler.success({ imageUrl });
  } catch (error) {
    logger.error("Upload failed", error);
    return ApiResponseHandler.error(error);
  }
}
```

### Example 3: Retrieving User Data

```typescript
// src/app/api/analyses/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { ApiResponseHandler, AnalysisUseCase, logger } from "@/lib";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    logger.debug("Fetching analyses", { userId: user.id });

    const useCase = await AnalysisUseCase.create(supabase);
    const analyses = await useCase.getUserAnalyses(user.id, 50);

    logger.info("Analyses retrieved", { count: analyses.length });

    return ApiResponseHandler.success({ analyses });
  } catch (error) {
    logger.error("Fetch failed", error);
    return ApiResponseHandler.error(error);
  }
}
```

### Example 4: Direct Repository Usage

```typescript
// Custom business logic
import { AnalysisRepository } from "@/lib/services";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function getAnalysisStats(userId: string) {
  try {
    const supabase = await createServerClient();
    const repo = new AnalysisRepository(supabase);

    // Get all user analyses
    const analyses = await repo.getByUserId(userId);

    // Calculate statistics
    const totalCount = analyses.length;
    const avgScore = analyses.reduce((sum, a) => sum + a.analysis.overall_score, 0) / totalCount;
    const byType = analyses.reduce((acc, a) => {
      const type = a.design_type || "unspecified";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info("Stats calculated", { totalCount, avgScore });

    return { totalCount, avgScore, byType };
  } catch (error) {
    logger.error("Stats calculation failed", error);
    throw error;
  }
}
```

## Testing Examples

### Unit Test: Validator

```typescript
import { RequestValidator, ValidationError } from "@/lib";

describe("RequestValidator", () => {
  it("validates analyze request", () => {
    const valid = RequestValidator.validateAnalyzeRequest({
      imageUrl: "https://example.com/image.png",
      designType: "landing_page"
    });

    expect(valid.imageUrl).toBe("https://example.com/image.png");
    expect(valid.designType).toBe("landing_page");
  });

  it("throws on invalid URL", () => {
    expect(() => {
      RequestValidator.validateAnalyzeRequest({
        imageUrl: "not-a-url"
      });
    }).toThrow(ValidationError);
  });
});
```

### Integration Test: Analyze Use Case

```typescript
import { AnalysisUseCase } from "@/lib/services";
import { createMockSupabaseClient } from "@/test/mocks";

describe("AnalysisUseCase", () => {
  it("analyzes and saves design", async () => {
    const mockClient = createMockSupabaseClient();
    const useCase = new AnalysisUseCase(
      mockGeminiService,
      mockRepository,
      mockStorage
    );

    const result = await useCase.analyzeAndSave(
      "user-123",
      "https://example.com/design.png",
      "landing_page"
    );

    expect(result.id).toBeDefined();
    expect(result.analysis.overall_score).toBeGreaterThan(0);
  });
});
```

## Error Handling Best Practices

### Do's ✅

```typescript
// Use specific error classes
throw new ValidationError("Invalid input");
throw new AuthenticationError();
throw new ExternalServiceError("Gemini", originalError);

// Log with context
logger.error("Operation failed", error, { userId, imageUrl });

// Use ApiResponseHandler for consistent responses
return ApiResponseHandler.error(error);
```

### Don'ts ❌

```typescript
// Don't use generic Error
throw new Error("Something went wrong");

// Don't log without context
console.error(error);

// Don't mix error formats
return NextResponse.json({ error: error.message });
```

## Logging Best Practices

### Info Level (Operations)

```typescript
logger.info("Design analyzed", { id, score: overall_score });
logger.info("File uploaded", { path, publicUrl });
```

### Debug Level (Details)

```typescript
logger.debug("Fetching image", { url });
logger.debug("Calling Gemini API", { model });
```

### Warning Level (Recoverable Issues)

```typescript
logger.warn("Validation failed", { field });
logger.warn("User not found", { userId });
```

### Error Level (Failures)

```typescript
logger.error("Analysis failed", error, { imageUrl });
logger.error("Database error", error, { operation: "insert" });
```

## Dependency Injection Pattern

### For Tests

```typescript
const mockGeminiService = {
  analyzeDesign: jest.fn().mockResolvedValue(mockAnalysis)
};

const useCase = new AnalysisUseCase(
  mockGeminiService,
  mockRepository,
  mockStorage
);
```

### For Production

```typescript
const useCase = await AnalysisUseCase.create(supabaseClient);
// Creates with real services via ServiceFactory
```

## Performance Tips

1. **Cache Gemini Service**: Singleton pattern prevents re-initialization
   ```typescript
   const geminiService = ServiceFactory.getGeminiService();
   ```

2. **Efficient Database Queries**: Select only needed fields
   ```typescript
   const { data } = await supabase
     .from("analyses")
     .select("id, analysis, created_at")  // Not SELECT *
     .eq("user_id", userId);
   ```

3. **Fail Fast**: Return early on validation errors
   ```typescript
   if (!imageUrl) throw new ValidationError("required");
   ```

## Common Tasks

### Analyze a Design
```typescript
const useCase = await AnalysisUseCase.create(supabase);
const result = await useCase.analyzeAndSave(userId, imageUrl, designType);
```

### Upload an Image
```typescript
const useCase = await UploadUseCase.create(supabase);
const imageUrl = await useCase.uploadDesignImage(buffer, fileName);
```

### Get User's Analyses
```typescript
const useCase = await AnalysisUseCase.create(supabase);
const analyses = await useCase.getUserAnalyses(userId);
```

### Delete an Analysis
```typescript
const useCase = await AnalysisUseCase.create(supabase);
await useCase.deleteAnalysis(analysisId);
```

## Troubleshooting

### "Unauthorized" Error
```typescript
// Check authentication first
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new AuthenticationError();
```

### "Invalid JSON Response"
```typescript
// Ensure Gemini response is valid
const parsed = JSON.parse(responseText);
// Use sanitization methods if needed
```

### "Storage Error"
```typescript
// Verify file path and permissions
const { path, publicUrl } = await storage.uploadImage(buffer, path, type);
```
