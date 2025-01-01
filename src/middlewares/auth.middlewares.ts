import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { UnauthorizedError } from "~/utils/error-handler"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"
import { capitalize } from "lodash"
import userService from "~/services/users.services"

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new UnauthorizedError("Access token is required", { token: "Access token is required" })
              }
              const prefix = value.split(" ")[0]
              const accessToken = value.split(" ")[1]
              if (!accessToken || prefix !== "Bearer") {
                throw new UnauthorizedError("Invalid token", { token: "Invalid token" })
              }
              const decoded_authorization = await verifyToken({ token: accessToken })
              req.decoded_authorization = decoded_authorization
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(capitalize(error.message), error)
              }
              throw error
            }
          },
        },
      },
    },
    ["headers"],
  ),
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new UnauthorizedError("Refresh token is required", { token: "Refresh token is required" })
              }
              const refresh_token = await userService.checkRefreshTokenExist(value)
              if (!refresh_token) {
                throw new UnauthorizedError("Refresh token does not exist", { token: "Refresh token does not exist" })
              }
              const decoded_refresh_token = await verifyToken({ token: value })
              req.decoded_refresh_token = decoded_refresh_token
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(capitalize(error.message), error)
              }
              throw error
            }
          },
        },
      },
    },
    ["body"],
  ),
)
