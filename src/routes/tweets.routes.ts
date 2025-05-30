import { Router } from "express"
import { createTweetController, getTweetDetailController } from "~/controllers/tweets.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { createTweetValidator } from "~/middlewares/tweet.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"
const tweetsRouter = Router()

tweetsRouter.post("/", accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))
tweetsRouter.get("/:tweet_id", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getTweetDetailController))

export default tweetsRouter
