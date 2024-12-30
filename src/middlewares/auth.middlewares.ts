import { checkSchema } from "express-validator"
import { UnauthorizedError } from "~/utils/error-handler"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new UnauthorizedError("Access token is required")
            }
            const prefix = value.split(" ")[0]
            const accessToken = value.split(" ")[1]
            if (!accessToken || prefix !== "Bearer") {
              throw new UnauthorizedError("Invalid token")
            }
            const decoded_authorization = await verifyToken({ token: accessToken })
            req.decoded_authorization = decoded_authorization
            return true
          },
        },
      },
    },
    ["headers"],
  ),
)
