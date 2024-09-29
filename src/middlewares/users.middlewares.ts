import { Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
import userService from "~/services/users.services"
import { validate } from "~/utils/validation"

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
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
      notEmpty: {
        errorMessage: "Email is required",
      },
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
            throw new Error("Email already exists")
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
      isISO8601: {
        errorMessage: "Date of birth is invalid",
        options: {
          strict: true,
          strictSeparator: true,
        },
      },
    },
  }),
)
