import { NextFunction, Request, Response } from "express"
import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import Tweet from "~/models/schemas/Tweet.schema"
import databaseService from "~/services/database.services"
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/types/enums"
import { BadRequestError, NotFoundError, UnauthorizedError } from "~/utils/error-handler"
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

export const tweetIdValidator = validate(
  checkSchema({
    tweet_id: {
      isMongoId: {
        errorMessage: "Tweet id is invalid",
      },
      custom: {
        options: async (value: string, { req }) => {
          const tweet = await databaseService.tweets.findOne({
            _id: new ObjectId(value),
          })
          if (!tweet) {
            throw new NotFoundError("Tweet ID not found")
          }
          req.tweet = tweet
          return true
        },
      },
    },
  }),
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Check if the user is not logged in
    if (!req.decoded_authorization) {
      throw new UnauthorizedError("You must be logged in to view this tweet")
    }

    const author = await databaseService.users.findOne({
      _id: tweet.user_id,
    })

    // Check if user is not found or banned
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new NotFoundError("User not found or banned")
    }

    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((item) => item.equals(user_id))
    if (!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new BadRequestError("Tweet is not public")
    }
  }
  next()
}
