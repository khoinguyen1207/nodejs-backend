import { Router } from "express"
import { bookmarksTweetController, unBookmarksTweetController } from "~/controllers/bookmarks.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

const bookmarksRouter = Router()

bookmarksRouter.post("", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarksTweetController))
bookmarksRouter.delete("/tweets/:tweet_id", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(unBookmarksTweetController))

export default bookmarksRouter
