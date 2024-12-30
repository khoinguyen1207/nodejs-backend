import { NextFunction, Request, RequestHandler, Response } from "express"
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

type ErrorType = {
  code: string
  [key: string]: any
}

export class DefaultError {
  message: string
  status: number
  error: ErrorType
  constructor(message: string, status: number, error: ErrorType) {
    this.message = message
    this.status = status
    this.error = error
  }
}

export class NotFoundError extends DefaultError {
  constructor(message: string, error: any) {
    super(message, httpStatus.NOT_FOUND, {
      code: "NOT_FOUND",
      ...error,
    })
  }
}

export class BadRequestError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.BAD_REQUEST, {
      code: "BAD_REQUEST",
      ...error,
    })
  }
}

export class UnauthorizedError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.UNAUTHORIZED, {
      code: "UNAUTHORIZED",
      ...error,
    })
  }
}

export class UnprocessableEntityError extends DefaultError {
  constructor(message: string, error?: any) {
    super(message, httpStatus.UNPROCESSABLE_ENTITY, {
      code: "UNPROCESSABLE_ENTITY",
      ...error,
    })
  }
}
