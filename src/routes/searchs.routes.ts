import { wrapRequestHandler } from "~/utils/error-handler"
import { searchController } from "./../controllers/searchs.controllers"
import { Router } from "express"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/auth.middlewares"

const searchRouter = Router()

searchRouter.get("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(searchController))

export default searchRouter
