import { Router } from "express"
import { bookmarksTweetController, unBookmarksTweetController } from "~/controllers/bookmarks.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { tweetIdValidator } from "~/middlewares/tweet.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

const bookmarksRouter = Router()

bookmarksRouter.post("", accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(bookmarksTweetController))
bookmarksRouter.delete(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarksTweetController),
)

export default bookmarksRouter
