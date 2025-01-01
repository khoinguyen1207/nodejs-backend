import { NextFunction, Request, Response } from "express"
import { validationResult, ValidationChain } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema"
import { omit } from "lodash"
import { httpStatus } from "~/constants/httpStatus"
import { DefaultError, UnprocessableEntityError } from "~/utils/error-handler"

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const error = validationResult(req)
    const errorObject = error.mapped()
    if (error.isEmpty()) {
      return next()
    }

    const entityError = new UnprocessableEntityError("Validation error", {})
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (msg instanceof DefaultError && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.error[key] = msg
    }
    res.status(entityError.status).json(omit(entityError, ["status"]))
  }
}
