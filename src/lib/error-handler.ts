/**
 * Centralized error handling middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { 
  AppError, 
  ApiErrorResponse, 
  ErrorContext,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError
} from '@/types/errors'
import { ApiError } from '@/utils/api-errors'

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extract error context from request
 */
function extractErrorContext(request: NextRequest): ErrorContext {
  return {
    requestId: generateRequestId(),
    path: request.nextUrl.pathname,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || undefined,
  }
}

/**
 * Map Supabase error codes to our error types
 */
function mapSupabaseError(error: unknown): AppError {
  const errorMap: Record<string, () => AppError> = {
    'PGRST116': () => new NotFoundError('Resource not found'),
    'PGRST301': () => new ValidationError('Invalid request'),
    '23505': () => new ValidationError('Duplicate value'),
    '23503': () => new ValidationError('Foreign key constraint violation'),
    '42501': () => new AuthorizationError('Database permission denied'),
    'JWT_EXPIRED': () => new AuthenticationError('Session expired'),
    'NO_AUTHORIZATION_HEADER': () => new AuthenticationError('Authorization header missing'),
  }

  const errorObj = error as Record<string, unknown>
  const code = String(errorObj.code || errorObj.error_code || '')
  const handler = errorMap[code]
  
  if (handler) {
    return handler()
  }

  // Default to generic error
  return new AppError(
    (errorObj.message as string) || 'Database error',
    500,
    false,
    { code }
  )
}

/**
 * Convert various error types to AppError
 */
function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Legacy ApiError from existing code
  if (error instanceof ApiError) {
    return new AppError(
      error.message,
      error.statusCode,
      true,
      error.details ? { details: error.details } : undefined
    )
  }

  // Supabase error
  if (error && typeof error === 'object' && ('code' in error || 'error_code' in error)) {
    return mapSupabaseError(error)
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('rate limit')) {
      return new RateLimitError()
    }
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return new AuthenticationError(error.message)
    }
    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return new AuthorizationError(error.message)
    }
    if (error.message.includes('not found')) {
      return new NotFoundError(error.message)
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return new ValidationError(error.message)
    }

    return new AppError(error.message, 500, false)
  }

  // Unknown error
  return new AppError('An unexpected error occurred', 500, false)
}

/**
 * Format error response
 */
function formatErrorResponse(
  error: AppError,
  context: ErrorContext
): ApiErrorResponse {
  const response: ApiErrorResponse = {
    error: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
  }

  // In development, include more details
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      ...error.details,
      stack: error.stack,
    }
  } else if (error.isOperational && error.details) {
    // In production, only include safe details for operational errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stack, ...safeDetails } = error.details
    response.details = safeDetails
  }

  return response
}

/**
 * Main error handler function
 */
export function handleError(
  error: unknown,
  request: NextRequest
): NextResponse<ApiErrorResponse> {
  const context = extractErrorContext(request)
  const appError = normalizeError(error)

  // Log the error
  if (appError.statusCode >= 500) {
    logger.error(
      `API Error: ${appError.message}`,
      appError,
      {
        ...context,
        statusCode: appError.statusCode,
        isOperational: appError.isOperational,
      }
    )
  } else if (appError.statusCode >= 400) {
    logger.warn(
      `API Warning: ${appError.message}`,
      {
        ...context,
        statusCode: appError.statusCode,
        details: appError.details,
      }
    )
  }

  // Format and return the response
  const responseBody = formatErrorResponse(appError, context)
  
  const headers: Record<string, string> = {
    'X-Request-Id': context.requestId || '',
  }
  
  if (appError instanceof RateLimitError && appError.details?.details) {
    const details = appError.details.details as Record<string, unknown>
    if (details.retryAfter) {
      headers['Retry-After'] = String(details.retryAfter)
    }
  }
  
  return NextResponse.json(responseBody, {
    status: appError.statusCode,
    headers,
  })
}

/**
 * Wrapper function for API route handlers with automatic error handling
 */
export function withErrorHandler<T extends unknown[], R>(
  handler: (request: NextRequest, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse<ApiErrorResponse>> => {
    const startTime = Date.now()
    const context = extractErrorContext(request)

    try {
      const result = await handler(request, ...args)
      
      // Log successful requests
      if (result instanceof NextResponse) {
        const duration = Date.now() - startTime
        const status = result.status
        
        logger.logRequest(
          request.method,
          request.nextUrl.pathname,
          status,
          duration,
          { requestId: context.requestId }
        )
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.logRequest(
        request.method,
        request.nextUrl.pathname,
        error instanceof AppError ? error.statusCode : 500,
        duration,
        { requestId: context.requestId, error: true }
      )

      return handleError(error, request)
    }
  }
}

/**
 * Express-style middleware for Next.js API routes
 */
export async function errorMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (error) {
    return handleError(error, request)
  }
}