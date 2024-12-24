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

export class ErrorWithStatus {
  message: string
  status: number
  constructor(message: string, status: number) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: any
  constructor({ message = "Validation Error", errors }: { message?: string; errors: any }) {
    super(message, httpStatus.UNPROCESSABLE_ENTITY)
    this.errors = errors
  }
}
