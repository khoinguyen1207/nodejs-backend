import { Router } from "express"
import { createTweetController } from "~/controllers/tweets.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { createTweetValidator } from "~/middlewares/tweet.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"
const tweetsRouter = Router()

tweetsRouter.post("/", accessTokenValidator, verifiedUserValidator, createTweetValidator, wrapRequestHandler(createTweetController))

export default tweetsRouter
