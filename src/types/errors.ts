/**
 * Error types and interfaces for consistent error handling
 */

export interface ApiErrorDetails {
  code?: string
  field?: string
  details?: unknown
  stack?: string
  timestamp?: string
  requestId?: string
}

export interface ApiErrorResponse {
  error: string
  statusCode: number
  details?: ApiErrorDetails
  timestamp: string
  requestId?: string
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: ApiErrorDetails

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: ApiErrorDetails
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: ApiErrorDetails) {
    super(message, 400, true, { ...details, field })
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: ApiErrorDetails) {
    super(message, 401, true, details)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: ApiErrorDetails) {
    super(message, 403, true, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: ApiErrorDetails) {
    super(message, 404, true, details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: ApiErrorDetails) {
    super(message, 409, true, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, true, { details: { retryAfter } })
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: unknown) {
    const message = `External service error: ${service}`
    super(message, 502, false, { details: originalError })
  }
}

export interface ErrorContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  ip?: string
  userAgent?: string
}