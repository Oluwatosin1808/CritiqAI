# Migration Guide: From Old to New Architecture

## Summary of Changes

The application has been refactored into a production-grade architecture with:
- ✅ Layered architecture with clear separation of concerns
- ✅ Service abstraction for Gemini and Supabase
- ✅ Repository pattern for data access
- ✅ Centralized error handling
- ✅ Request validation and DTOs
- ✅ Consistent API response formatting
- ✅ Structured logging
- ✅ Service factory pattern for dependency management

## File Structure Changes

### New Files Created

```
src/lib/
├── errors/
│   └── app-error.ts              (NEW: Custom error classes)
├── services/
│   ├── index.ts                  (NEW: Service exports)
│   ├── base-supabase-service.ts  (NEW: Base class for services)
│   ├── gemini-service.ts         (REFACTORED: Class-based, error handling)
│   ├── storage-service.ts        (NEW: Storage operations)
│   ├── analysis-repository.ts    (NEW: Data access layer)
│   ├── application-services.ts   (NEW: Use cases/orchestration)
│   └── service-factory.ts        (NEW: Service instantiation)
├── logger.ts                      (NEW: Structured logging)
├── validators.ts                  (NEW: Request validation & DTOs)
├── api-response-handler.ts        (NEW: Consistent API responses)
└── index.ts                       (NEW: Central export point)

ARCHITECTURE.md                    (NEW: Complete architecture guide)
MIGRATION.md                       (THIS FILE)
```

### Deprecated Files

- `src/services/gemini.ts` - **Can be removed**, functionality moved to `src/lib/services/gemini-service.ts`

### Updated Files

- `src/app/api/analyze/route.ts` - Now uses use cases and validators
- `src/app/api/upload/route.ts` - Now uses use cases and validators
- `src/app/api/analyses/route.ts` - Now uses use cases

## API Changes

### Analyze Endpoint

**Before:**
```typescript
// Old: Direct service calls and manual error handling
const analysis = await analyzeDesign(imageUrl, validDesignType);
const { data, error } = await supabase.from("analyses").insert({...});
if (error) return NextResponse.json({ error: "..." }, { status: 500 });
return NextResponse.json({ id: data.id, analysis });
```

**After:**
```typescript
// New: Validated input, use case orchestration, consistent responses
const { imageUrl, designType } = RequestValidator.validateAnalyzeRequest(body);
const analysisUseCase = await AnalysisUseCase.create(supabase);
const analysis = await analysisUseCase.analyzeAndSave(user.id, imageUrl, designType);
return ApiResponseHandler.success({ id: analysis.id, analysis: analysis.analysis }, 200);
```

### Upload Endpoint

**Before:**
```typescript
if (!ACCEPTED_TYPES.includes(file.type)) {
  return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
}
const admin = createAdminClient();
const { error: uploadError } = await admin.storage.from("designs").upload(...);
```

**After:**
```typescript
RequestValidator.validateUploadRequest(file);
const uploadUseCase = await UploadUseCase.create(supabase);
const imageUrl = await uploadUseCase.uploadDesignImage(buffer, file.name);
return ApiResponseHandler.success({ imageUrl }, 200);
```

### Analyses Endpoint

**Before:**
```typescript
const { data, error } = await supabase
  .from("analyses")
  .select("*")
  .eq("user_id", user.id);
return NextResponse.json({ analyses: data });
```

**After:**
```typescript
const analysisUseCase = await AnalysisUseCase.create(supabase);
const analyses = await analysisUseCase.getUserAnalyses(user.id);
return ApiResponseHandler.success({ analyses }, 200);
```

## Error Handling Changes

### Before

```typescript
try {
  // code
} catch (error) {
  console.error("Error:", error);
  const message = error instanceof Error ? error.message : "Failed";
  return NextResponse.json({ error: message }, { status: 500 });
}
```

### After

```typescript
try {
  // code
} catch (error) {
  logger.error("Operation failed", error);
  return ApiResponseHandler.error(error);
}
```

The new error handling:
- ✅ Automatically maps error codes to HTTP status codes
- ✅ Returns consistent error format: `{ success: false, error: { code, message } }`
- ✅ Logs errors with context
- ✅ Never exposes internal error details in production

## Service Usage Examples

### Using the Gemini Service

```typescript
// Before
import { analyzeDesign } from "@/services/gemini";
const result = await analyzeDesign(imageUrl, designType);

// After
import { ServiceFactory } from "@/lib/services";
const geminiService = ServiceFactory.getGeminiService();
const result = await geminiService.analyzeDesign(imageUrl, designType);
```

### Using Storage Service

```typescript
// Before (direct API calls)
const admin = createAdminClient();
const { error } = await admin.storage.from("designs").upload(fileName, buffer, {...});

// After (service abstraction)
import { ServiceFactory } from "@/lib/services";
const storage = ServiceFactory.getStorageService(supabaseClient);
const { path, publicUrl } = await storage.uploadImage(buffer, fileName, contentType);
```

### Using Analysis Repository

```typescript
// Before (direct DB calls)
const { data, error } = await supabase
  .from("analyses")
  .insert({...})
  .select("id")
  .single();

// After (repository pattern)
import { AnalysisRepository } from "@/lib/services";
const repo = new AnalysisRepository(supabaseClient);
const analysis = await repo.create({ userId, imageUrl, designType, analysis });
```

## Component Updates

If you're using these services in components, update imports:

```typescript
// Before
import { analyzeDesign } from "@/services/gemini";

// After
import { ServiceFactory } from "@/lib/services";
// Then in your code:
const geminiService = ServiceFactory.getGeminiService();
```

## Testing Updates

### Old Testing Pattern

```typescript
// Mock direct function
jest.mock("@/services/gemini", () => ({
  analyzeDesign: jest.fn()
}));
```

### New Testing Pattern

```typescript
// Mock service class
jest.mock("@/lib/services/gemini-service", () => ({
  GeminiService: jest.fn().mockImplementation(() => ({
    analyzeDesign: jest.fn()
  }))
}));

// Or mock use case
jest.mock("@/lib/services/application-services", () => ({
  AnalysisUseCase: {
    create: jest.fn().mockResolvedValue({
      analyzeAndSave: jest.fn()
    })
  }
}));
```

## Validation Pattern

Add request validation at the start of API routes:

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate input - throws ValidationError if invalid
    const { imageUrl, designType } = RequestValidator.validateAnalyzeRequest(body);
    
    // Continue with valid data
    // ...
  } catch (error) {
    return ApiResponseHandler.error(error);
  }
}
```

## Response Format Changes

### Before
```json
{
  "id": "123",
  "analysis": {...}
}
// or on error:
{
  "error": "Failed to save analysis"
}
```

### After
```json
{
  "success": true,
  "data": {
    "id": "123",
    "analysis": {...}
  }
}
// or on error:
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to save analysis"
  }
}
```

## Logging

Replace console logs with structured logger:

```typescript
// Before
console.error("Error:", error);
console.log("Starting upload", fileName);

// After
import { logger } from "@/lib/logger";
logger.error("Operation failed", error);
logger.debug("Starting upload", { fileName });
```

Log levels:
- `debug()` - Development details (disabled in production)
- `info()` - Important events
- `warn()` - Warning conditions
- `error()` - Error conditions with stack traces

## Environment Variables

No changes needed, but ensure you have:
```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Backwards Compatibility

The new architecture is **mostly backwards compatible**:
- Old Supabase client imports still work
- Old environment variables still used
- Database schema unchanged

What needs updating:
- ✅ API routes using old error handling
- ✅ Components using old service imports
- ✅ Tests using old mocks

## Cleanup Steps

1. **Remove old service file** (optional):
   ```bash
   rm src/services/gemini.ts
   ```

2. **Update all imports** in components and pages:
   ```typescript
   // Change from:
   import { analyzeDesign } from "@/services/gemini";
   // To:
   import { ServiceFactory } from "@/lib/services";
   ```

3. **Update tests** to use new service structure

4. **Verify error handling** in all API routes

## Troubleshooting

### "Cannot find module" errors

**Problem:** Import errors after refactoring
**Solution:** Check file paths and use the new index exports:
```typescript
import { AnalysisUseCase, ServiceFactory } from "@/lib/services";
```

### "Service not initialized" errors

**Problem:** Services called before initialization
**Solution:** Use the factory pattern:
```typescript
const geminiService = ServiceFactory.getGeminiService();
```

### Type errors in use cases

**Problem:** Missing generics or type mismatches
**Solution:** Check that repository and service return types match

## Support & Questions

Refer to `ARCHITECTURE.md` for:
- Detailed layer descriptions
- Service patterns and usage
- Data flow examples
- Best practices
- Extension guidelines
