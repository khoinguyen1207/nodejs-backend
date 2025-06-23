import { checkSchema } from "express-validator"
import { MediaTypeQuery } from "~/types/enums"
import { validate } from "~/utils/validation"

export const searchValidator = validate(
  checkSchema({
    content: {
      isString: {
        errorMessage: "Content must be a string",
      },
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)],
      },
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [["on", "off"]],
        errorMessage: "People follow must be 'on' or 'off'",
      },
    },
  }),
)

export const paginationValidator = validate(
  checkSchema({
    page: {
      custom: {
        options: (value, { req }) => {
          if (!value) {
            ;(req.query as any).page = 1
          }
          if (value && !Number.isInteger(Number(value))) {
            throw new Error("Page must be an integer")
          }
          if (value && Number(value) < 1) {
            throw new Error("Page must be >= 1")
          }
          return true
        },
      },
    },
    limit: {
      custom: {
        options: (value, { req }) => {
          if (!value) {
            ;(req.query as any).limit = 10
          }
          if (value && !Number.isInteger(Number(value))) {
            throw new Error("Limit must be an integer")
          }
          if (value && Number(value) < 1) {
            throw new Error("Limit must be >= 1")
          }
          return true
        },
      },
    },
  }),
)
