import { NextFunction, Request, Response } from "express"
import { omit } from "lodash"
import { httpStatus } from "~/constants/httpStatus"
import { ErrorWithStatus } from "~/utils/error-handler"

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({
      message: err.message,
      errors: {
        ...err.errors,
      },
    })
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    errors: omit(err, ["stack"]),
  })
}
