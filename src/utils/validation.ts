import { NextFunction, Request, Response } from "express"
import { validationResult, ValidationChain } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema"
import { httpStatus } from "~/constants/httpStatus"
import { DefaultError, ErrorWithStatus } from "~/utils/error-handler"

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const error = validationResult(req)
    const errorObject = error.mapped()
    if (error.isEmpty()) {
      return next()
    }

    const entityError = new DefaultError({ message: "Validation error", errors: {} })
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = msg
    }
    res.status(httpStatus.UNPROCESSABLE_ENTITY).json(entityError)
  }
}
