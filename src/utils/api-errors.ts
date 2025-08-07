import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Handle our custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details
      },
      { status: error.statusCode }
    )
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    
    // Map common Supabase error codes to HTTP status codes
    const errorMap: Record<string, number> = {
      'PGRST116': 404, // Not found
      'PGRST301': 400, // Bad request
      '23505': 409,    // Duplicate key
      '23503': 400,    // Foreign key violation
      '42501': 403,    // Insufficient privileges
    }
    
    const statusCode = errorMap[supabaseError.code] || 500
    
    return NextResponse.json(
      {
        error: supabaseError.message || 'Database error',
        code: supabaseError.code
      },
      { status: statusCode }
    )
  }

  // Handle standard errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred'
    },
    { status: 500 }
  )
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details })
    },
    { status: statusCode }
  )
}

export function createSuccessResponse(
  data: any,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(data, { status: statusCode })
}

// Authentication helpers
export async function requireAuth(
  supabase: any,
  allowedEmails?: string[]
): Promise<any> {
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
  data: any,
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