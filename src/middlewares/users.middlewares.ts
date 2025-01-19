import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { capitalize } from "lodash"
import { envConfig } from "~/constants/config"
import userService from "~/services/users.services"
import { UnauthorizedError } from "~/utils/error-handler"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"

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

export const verifyEmailValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new UnauthorizedError("Email verify token is required", { token: "Email verify  token is required" })
              }
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.EMAIL_VERIFICATION_SECRET_KEY,
              })
              req.decoded_email_verify_token = decoded_email_verify_token
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

export const forgotPasswordValidator = validate(
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
    },
    ["body"],
  ),
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
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
      forgot_password_token: {
        notEmpty: {
          errorMessage: "Forgot password token is required",
        },
        custom: {
          options: async (value, { req }) => {
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.FORGOT_PASSWORD_SECRET_KEY,
              })
              req.decoded_forgot_password_token = decoded_forgot_password_token
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
