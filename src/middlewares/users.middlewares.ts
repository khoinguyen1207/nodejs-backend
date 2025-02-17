import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { capitalize } from "lodash"
import { ObjectId } from "mongodb"
import { envConfig } from "~/constants/config"
import { REGEX_USERNAME } from "~/constants/regex"
import databaseService from "~/services/database.services"
import userService from "~/services/users.services"
import { BadRequestError, NotFoundError, UnauthorizedError } from "~/utils/error-handler"
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
                throw new UnauthorizedError("Email verify token is required")
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

export const updateProfileValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
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
      date_of_birth: {
        optional: true,
        isISO8601: {
          errorMessage: "Date of birth is invalid",
          options: {
            strict: true,
            strictSeparator: true,
          },
        },
      },
      bio: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Bio must be between 1 and 255 characters",
          options: {
            min: 1,
            max: 255,
          },
        },
      },
      location: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Location must be between 5 and 255 characters",
          options: {
            min: 5,
            max: 255,
          },
        },
      },
      website: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Website must be between 5 and 255 characters",
          options: {
            min: 5,
            max: 255,
          },
        },
      },
      username: {
        optional: true,
        isString: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error("Username is invalid (only contains a-z, A-Z, 0-9, _)")
            }
            const user = await databaseService.users.findOne({
              username: value,
              _id: { $ne: new ObjectId(req.decoded_authorization.user_id) },
            })
            if (user) {
              throw Error("Username is already exist")
            }
          },
        },
      },
      avatar: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Avatar must be between 5 and 400 characters",
          options: {
            min: 5,
            max: 400,
          },
        },
      },
      cover_photo: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          errorMessage: "Cover photo must be between 1 and 400 characters",
          options: {
            min: 1,
            max: 400,
          },
        },
      },
    },
    ["body"],
  ),
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new BadRequestError("Followed user id is invalid")
            }
            const followed_user = await databaseService.users.findOne({
              _id: new ObjectId(value),
            })
            if (!followed_user) {
              throw new NotFoundError("User not found")
            }
            if (value === req.decoded_authorization.user_id) {
              throw new BadRequestError("You cannot follow yourself")
            }
            return true
          },
        },
      },
    },
    ["body"],
  ),
)

export const unFollowValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new BadRequestError("User id is invalid")
            }
            return true
          },
        },
      },
    },
    ["params"],
  ),
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        notEmpty: {
          errorMessage: "Old password is required",
        },
        isString: true,
        trim: true,
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
        notEmpty: {
          errorMessage: "Confirm password is required",
        },
        isString: true,
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
    },
    ["body"],
  ),
)
