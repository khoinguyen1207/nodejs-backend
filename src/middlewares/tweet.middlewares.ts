import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/types/enums"
import { numberEnumToArray } from "~/utils/helper"
import { validate } from "~/utils/validation"

const enumTypes = numberEnumToArray(TweetType)
const enumAudiences = numberEnumToArray(TweetAudience)
const enumMedias = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [enumTypes],
          errorMessage: "Type is invalid",
        },
      },
      audience: {
        isIn: {
          options: [enumAudiences],
          errorMessage: "Audience is invalid",
        },
      },
      content: {
        isString: {
          errorMessage: "Content must be a string",
        },
        custom: {
          options: (value, { req }) => {
            const hashtags = req.body.hashtags
            const mentions = req.body.mentions
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(req.body.type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              !value
            ) {
              throw new Error("Content must not be empty")
            }
            if ([TweetType.Retweet].includes(req.body.type) && value) {
              throw new Error("Retweet must not have content")
            }
            return true
          },
        },
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(req.body.type) && !ObjectId.isValid(value)) {
              throw new Error("Parent id is invalid")
            }
            if (TweetType.Tweet === req.body.type && value !== null) {
              throw new Error("Parent id must be null")
            }
            return true
          },
        },
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value) => {
            if (!value.every((item: any) => typeof item === "string")) {
              throw new Error("Hashtags must be an array of strings")
            }
            return true
          },
        },
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value) => {
            if (!value.every((item: any) => typeof item === "string" && ObjectId.isValid(item))) {
              throw new Error("Mentions must be an array of user ids")
            }
            return true
          },
        },
      },
      medias: {
        isArray: true,
        custom: {
          options: (value) => {
            if (
              !value.every((item: any) => {
                return typeof item.url === "string" && enumMedias.includes(item.type)
              })
            ) {
              throw new Error("Medias must be an array of objects with url and type")
            }
            return true
          },
        },
      },
    },
    ["body"],
  ),
)
