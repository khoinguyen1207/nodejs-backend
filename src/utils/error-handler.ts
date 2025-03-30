import { NextFunction, Request, RequestHandler, Response } from "express"
import { ErrorCodes } from "~/types/enums"
import { httpStatus } from "~/constants/httpStatus"

export function wrapRequestHandler(func: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export class DefaultError {
  message: string
  status: httpStatus
  code: ErrorCodes
  error?: any
  constructor(message: string, status: httpStatus, code: ErrorCodes, error?: any) {
    this.message = message
    this.status = status
    this.code = code
    this.error = error
  }
}

export class NotFoundError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND, error)
  }
}

export class BadRequestError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.BAD_REQUEST, ErrorCodes.BAD_REQUEST, error)
  }
}

export class UnauthorizedError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, error)
  }
}

export class UnprocessableEntityError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.UNPROCESSABLE_ENTITY, ErrorCodes.UNPROCESSABLE_ENTITY, error)
  }
}
