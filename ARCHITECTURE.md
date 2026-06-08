# Production-Grade Architecture Guide

## Overview

This application follows a **layered architecture** pattern with clear separation of concerns, making it scalable, testable, and maintainable.

## Architecture Layers

### 1. **API Layer** (`src/app/api/`)

Entry points for HTTP requests. Handles:
- Request parsing and validation
- Authentication checks
- Response formatting and error handling
- Delegating business logic to use cases

**Key Responsibilities:**
- Use `RequestValidator` for input validation
- Use `ApiResponseHandler` for consistent responses
- Never contain business logic directly
- Always authenticate before processing

**Example:**
```typescript
// src/app/api/analyze/route.ts
const { imageUrl, designType } = RequestValidator.validateAnalyzeRequest(body);
const analysisUseCase = await AnalysisUseCase.create(supabase);
const analysis = await analysisUseCase.analyzeAndSave(user.id, imageUrl, designType);
return ApiResponseHandler.success({ id: analysis.id, analysis: analysis.analysis });
```

### 2. **Application Services Layer** (`src/lib/services/application-services.ts`)

Use cases that orchestrate the business logic by coordinating multiple domain services.

**Key Classes:**
- `AnalysisUseCase`: Coordinates design analysis and persistence
- `UploadUseCase`: Coordinates file upload and storage

**Responsibilities:**
- Implement business workflows
- Coordinate between repositories and domain services
- Handle cross-cutting concerns (logging, error handling)

### 3. **Domain Services Layer**

Encapsulates specific business domains and external integrations.

#### `GeminiService` (`src/lib/services/gemini-service.ts`)
- Manages Gemini AI API integration
- Handles image analysis
- Validates and sanitizes responses
- Provides factory function for easy initialization

```typescript
const geminiService = new GeminiService({ apiKey: process.env.GEMINI_API_KEY! });
const result = await geminiService.analyzeDesign(imageUrl, designType);
```

#### `StorageService` (`src/lib/services/storage-service.ts`)
- Manages file uploads to Supabase Storage
- Provides public URLs for uploaded files
- Handles storage-specific errors

```typescript
const storage = new StorageService(supabaseClient);
const { path, publicUrl } = await storage.uploadImage(buffer, fileName, contentType);
```

#### `BaseSupabaseService` (`src/lib/services/base-supabase-service.ts`)
- Base class for all Supabase-dependent services
- Provides common utilities:
  - User authentication checks
  - Error handling for Supabase errors
  - Centralized client access

### 4. **Repository Layer** (`src/lib/services/`)

Data access objects that abstract database operations.

#### `AnalysisRepository`
Provides CRUD operations for analyses:
- `create(input)`: Save new analysis
- `getById(id)`: Fetch single analysis
- `getByUserId(userId, limit)`: Fetch user's analyses
- `deleteById(id)`: Delete analysis

```typescript
const repo = new AnalysisRepository(supabaseClient);
const analysis = await repo.create({
  userId: user.id,
  imageUrl,
  designType,
  analysis: analysisResult
});
```

### 5. **Error Handling Layer** (`src/lib/errors/`)

Centralized error definitions with HTTP status code mapping.

**Error Classes:**
- `AppError`: Base error class
- `ValidationError`: Input validation failures (422)
- `AuthenticationError`: Auth failures (401)
- `NotFoundError`: Resource not found (404)
- `ExternalServiceError`: Third-party service failures (502)

**Usage:**
```typescript
throw new ValidationError("Invalid input", { field: "imageUrl" });
throw new AuthenticationError();
throw new ExternalServiceError("Gemini", originalError);
```

### 6. **Validation & Formatting Layer** (`src/lib/validators.ts`)

Request DTOs and validators for input validation.

```typescript
const validated = RequestValidator.validateAnalyzeRequest(body);
// Returns: { imageUrl: string, designType?: DesignType }
```

### 7. **Utilities Layer**

#### `ApiResponseHandler` (`src/lib/api-response-handler.ts`)
- Consistent JSON response formatting
- Automatic error serialization
- HTTP status code management

```typescript
return ApiResponseHandler.success(data, 200);
return ApiResponseHandler.error(error);
```

#### `Logger` (`src/lib/logger.ts`)
- Structured logging
- Environment-aware log levels
- Error context preservation

```typescript
logger.info("Operation successful", { id: "123" });
logger.error("Operation failed", error, { context: data });
```

## Service Factory Pattern

`ServiceFactory` provides centralized service instantiation:

```typescript
// Get singleton services
const geminiService = ServiceFactory.getGeminiService();

// Create services with dependencies
const storage = ServiceFactory.getStorageService(supabaseClient);
const repo = ServiceFactory.getAnalysisRepository(supabaseClient);

// Create all services for a context
const adminServices = await ServiceFactory.getAdminServices();
const userServices = await ServiceFactory.getUserServices();
```

## Dependency Injection

Services are instantiated with their dependencies passed in the constructor:

```typescript
// Domain service receives client
const storage = new StorageService(supabaseClient);

// Use case receives all dependencies
const useCase = new AnalysisUseCase(
  geminiService,
  analysisRepository,
  storageService
);
```

## Data Flow Example: Design Analysis

```
1. API Request
   ↓
2. RequestValidator.validateAnalyzeRequest(body)
   ↓
3. AnalysisUseCase.analyzeAndSave(userId, imageUrl, designType)
   ├─ GeminiService.analyzeDesign(imageUrl, designType)
   │  ├─ Fetch image from URL
   │  ├─ Call Gemini API
   │  └─ Parse and validate response
   └─ AnalysisRepository.create({ userId, imageUrl, designType, analysis })
      ↓
4. ApiResponseHandler.success({ id, analysis }, 200)
```

## Error Handling Flow

```
API Route
  ↓ (wrap in try-catch)
  ↓ RequestValidator (throws ValidationError)
  ↓ AnalysisUseCase
  ├─ GeminiService (throws ExternalServiceError)
  └─ AnalysisRepository (throws AppError)
  ↓ (catch error)
  ↓ ApiResponseHandler.error(error)
     → Returns standardized error response with code & message
```

## Configuration Management

### Environment Variables

```env
# Gemini
GEMINI_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Secrets

- Never hardcode secrets
- Use environment variables
- Service layer abstracts secret access

## Testing Strategies

### Unit Tests
- Test validators with various inputs
- Test error classes
- Test logger with different levels

### Integration Tests
- Mock Supabase clients
- Mock Gemini API responses
- Test use cases with mocked dependencies

### E2E Tests
- Test complete flows from API to database
- Use test user accounts
- Clean up test data

## Best Practices

### 1. **Always Validate Input**
```typescript
const validated = RequestValidator.validateAnalyzeRequest(body);
```

### 2. **Use Error Classes**
```typescript
throw new ValidationError("message");
// Not: throw new Error("message")
```

### 3. **Log Operations**
```typescript
logger.debug("Starting operation", { userId });
logger.error("Operation failed", error);
```

### 4. **Handle Errors at API Boundary**
```typescript
try {
  // business logic
} catch (error) {
  return ApiResponseHandler.error(error);
}
```

### 5. **Separate Concerns**
- API routes: Request/Response handling
- Use cases: Business orchestration
- Domain services: Specific business logic
- Repositories: Data access
- Validators: Input validation
- Error handlers: Error transformation

## Extending the Architecture

### Adding a New Feature

1. **Create a Repository** (if accessing data)
   ```typescript
   export class NewRepository extends BaseSupabaseService {
     async create(input): Promise<NewEntity> { ... }
   }
   ```

2. **Create Domain Service** (if complex logic)
   ```typescript
   export class NewService {
     async operation(): Promise<Result> { ... }
   }
   ```

3. **Create Use Case** (orchestration)
   ```typescript
   export class NewUseCase {
     async execute(): Promise<Result> { ... }
   }
   ```

4. **Create API Route**
   ```typescript
   export async function POST(request: Request) {
     const validated = RequestValidator.validateNewRequest(body);
     const useCase = await NewUseCase.create(supabase);
     const result = await useCase.execute();
     return ApiResponseHandler.success(result);
   }
   ```

5. **Add Validators**
   ```typescript
   export interface NewRequestDTO { ... }
   static validateNewRequest(data): NewRequestDTO { ... }
   ```

## Migration from Old Architecture

Old patterns to avoid:
```typescript
// ❌ Mixing concerns in API routes
export async function POST(request: Request) {
  // Database logic
  // API logic
  // Business logic mixed together
}

// ❌ Inconsistent error handling
throw new Error("message")
console.error("error")
return NextResponse.json({ error: "msg" })

// ❌ Direct API key exposure
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
```

New patterns to follow:
```typescript
// ✅ Separated concerns
const useCase = await AnalysisUseCase.create(supabase);
const result = await useCase.analyzeAndSave(...);
return ApiResponseHandler.success(result);

// ✅ Consistent error handling
try { ... } catch (error) { return ApiResponseHandler.error(error); }

// ✅ Service abstraction
const geminiService = ServiceFactory.getGeminiService();
```

## Performance Considerations

1. **Service Factory Singleton**: Gemini service is cached to avoid re-initialization
2. **Database Queries**: Use select() and where() for efficient queries
3. **Error Handling**: Fail fast with clear error messages
4. **Logging**: Use debug level for verbose info (disabled in production)

## Security Considerations

1. **Authentication**: All API routes check for authenticated user
2. **Error Messages**: Don't expose internal details in responses
3. **File Validation**: Check file type and size before processing
4. **URL Validation**: Validate image URLs before fetching
5. **Service Role Key**: Only used in admin operations (server-side)
