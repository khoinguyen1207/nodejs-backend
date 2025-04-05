import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { UnauthorizedError } from "~/utils/error-handler"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"
import { capitalize, pick } from "lodash"
import userService from "~/services/users.services"
import { envConfig } from "~/constants/config"
import { TokenPayload } from "~/types/jwt"
import databaseService from "~/services/database.services"
import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/types/enums"
import { NextFunction, Request, Response } from "express"

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new UnauthorizedError("Access token is required")
              }
              const prefix = value.split(" ")[0]
              const accessToken = value.split(" ")[1]
              if (!accessToken || prefix !== "Bearer") {
                throw new UnauthorizedError("Invalid token")
              }
              const decoded_authorization = await verifyToken({ token: accessToken, secretOrPublicKey: envConfig.ACCESS_TOKEN_SECRET_KEY })
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
                throw new UnauthorizedError("Refresh token is required")
              }
              const decoded_refresh_token = await verifyToken({ token: value, secretOrPublicKey: envConfig.REFRESH_TOKEN_SECRET_KEY })
              const refresh_token = await userService.checkRefreshTokenExist(value)
              if (!refresh_token) {
                throw new UnauthorizedError("Refresh token does not exist")
              }
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

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decoded_authorization as TokenPayload
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new UnauthorizedError("User not found")
    }
    if (user.verify !== UserVerifyStatus.Verified) {
      throw new UnauthorizedError("User is not verified")
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const filterMiddleware = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, fields)
    next()
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isString: true,
        trim: true,
        isEmail: {
          errorMessage: "Email is invalid",
        },
        isLength: {
          errorMessage: "Email must be between 6 and 255 characters",
          options: {
            min: 6,
            max: 255,
          },
        },
      },
      password: {
        notEmpty: {
          errorMessage: "Password is required",
        },
        isString: true,
        trim: true,
        isStrongPassword: {
          errorMessage: "Password must be at least 6 characters, 1 lowercase, 1 uppercase, 1 number, 1 symbol",
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            // returnScore: true, // Return độ mạnh password với range điểm
          },
        },
      },
    },
    ["body"],
  ),
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: "Name is required",
        },
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Name must be between 1 and 255 characters",
          options: {
            min: 1,
            max: 255,
          },
        },
      },
      email: {
        isString: true,
        trim: true,
        isEmail: {
          errorMessage: "Email is invalid",
        },
        isLength: {
          errorMessage: "Email must be between 6 and 255 characters",
          options: {
            min: 6,
            max: 255,
          },
        },
        custom: {
          options: async (value) => {
            const isEmailExist = await userService.checkEmailExist(value)
            if (isEmailExist) {
              throw new Error("Email is already exist")
            }
            return true
          },
        },
      },
      password: {
        notEmpty: {
          errorMessage: "Password is required",
        },
        isString: true,
        trim: true,
        isStrongPassword: {
          errorMessage: "Password must be at least 6 characters, 1 lowercase, 1 uppercase, 1 number, 1 symbol",
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            // returnScore: true, // Return độ mạnh password với range điểm
          },
        },
      },
      confirm_password: {
        isString: true,
        notEmpty: {
          errorMessage: "Confirm password is required",
        },
        trim: true,
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Password confirmation does not match password")
            }
            return true
          },
        },
      },
      date_of_birth: {
        notEmpty: {
          errorMessage: "Date of birth is required",
        },
        isISO8601: {
          errorMessage: "Date of birth is invalid",
          options: {
            strict: true,
            strictSeparator: true,
          },
        },
      },
    },
    ["body"],
  ),
)
