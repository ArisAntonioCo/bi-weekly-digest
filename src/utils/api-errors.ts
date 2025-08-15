import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { AppError } from '@/types/errors'

/**
 * Legacy ApiError class - maintained for backward compatibility
 * New code should use AppError from @/types/errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Legacy error handler - maintained for backward compatibility
 * New code should use handleError from @/middleware/error-handler
 */
export function handleApiError(error: unknown): NextResponse {
  // Log the error using new logger
  logger.error('Legacy API Error Handler', error)

  // Convert to AppError for consistent handling
  let appError: AppError

  if (error instanceof ApiError) {
    appError = new AppError(
      error.message,
      error.statusCode,
      true,
      error.details ? { details: error.details } : undefined
    )
  } else if (error instanceof AppError) {
    appError = error
  } else if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message?: string }
    
    // Map common Supabase error codes to HTTP status codes
    const errorMap: Record<string, number> = {
      'PGRST116': 404, // Not found
      'PGRST301': 400, // Bad request
      '23505': 409,    // Duplicate key
      '23503': 400,    // Foreign key violation
      '42501': 403,    // Insufficient privileges
    }
    
    const statusCode = errorMap[supabaseError.code] || 500
    appError = new AppError(
      supabaseError.message || 'Database error',
      statusCode,
      false,
      { code: supabaseError.code }
    )
  } else if (error instanceof Error) {
    appError = new AppError(error.message || 'Internal server error', 500, false)
  } else {
    appError = new AppError('An unexpected error occurred', 500, false)
  }

  // Format response
  const response: { error: string; details?: unknown; timestamp?: string } = {
    error: appError.message,
    timestamp: new Date().toISOString()
  }
  
  if (process.env.NODE_ENV === 'development' && appError.details) {
    response.details = appError.details
  }
  
  return NextResponse.json(response, { status: appError.statusCode })
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse {
  const response: { error: string; details?: unknown } = {
    error: message
  }
  
  if (details !== undefined) {
    response.details = details
  }
  
  return NextResponse.json(response, { status: statusCode })
}

export function createSuccessResponse(
  data: unknown,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(data, { status: statusCode })
}

// Authentication helpers
interface SupabaseClient {
  auth: {
    getUser: () => Promise<{ 
      data: { user: { email?: string; [key: string]: unknown } | null }; 
      error: Error | null 
    }>
  }
}

export async function requireAuth(
  supabase: SupabaseClient,
  allowedEmails?: string[]
): Promise<{ email?: string; [key: string]: unknown }> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new ApiError(401, 'Authentication required')
  }
  
  if (allowedEmails && !allowedEmails.includes(user.email || '')) {
    throw new ApiError(403, 'Insufficient permissions')
  }
  
  return user
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): void {
  const now = Date.now()
  const userLimit = requestCounts.get(identifier)
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return
  }
  
  if (userLimit.count >= maxRequests) {
    throw new ApiError(429, 'Too many requests', {
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    })
  }
  
  userLimit.count++
}

// Input validation helper
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new ApiError(400, 'Missing required fields', { missing })
  }
}

// Sanitize HTML input
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}