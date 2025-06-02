import { Router } from "express"
import {
  createTweetController,
  getTweetDetailController,
  likeTweetController,
  unLikeTweetController,
} from "~/controllers/tweets.controllers"
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { audienceValidator, createTweetValidator, tweetIdValidator } from "~/middlewares/tweet.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"
const tweetsRouter = Router()

tweetsRouter.post("/", accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))
tweetsRouter.get(
  "/:tweet_id",
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetDetailController),
)
tweetsRouter.post("/like", accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(likeTweetController))
tweetsRouter.delete(
  "/unlike/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController),
)

export default tweetsRouter
