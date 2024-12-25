import { NextFunction, Request, RequestHandler, Response } from "express"

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
  errors: any
  constructor(message: string, status: number, errors: any) {
    this.message = message
    this.status = status
    this.errors = errors
  }
}

export class DefaultError {
  message: string
  errors: any
  constructor({ message, errors }: { message: string; errors: any }) {
    this.message = message
    this.errors = errors
  }
}
