import { NextFunction, Request, Response } from "express"
import { omit } from "lodash"
import { httpStatus } from "~/constants/httpStatus"
import { ErrorWithStatus } from "~/utils/error-handler"

export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorWithStatus) {
    return res.status(error.status).json({
      message: error.message,
      error: omit(error, ["status", "message"]),
    })
  }
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
    error: error,
  })
}
