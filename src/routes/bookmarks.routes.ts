import { Router } from "express"
import { bookmarksTweetController } from "~/controllers/bookmarks.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

const bookmarksRouter = Router()

bookmarksRouter.post("", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarksTweetController))

export default bookmarksRouter
