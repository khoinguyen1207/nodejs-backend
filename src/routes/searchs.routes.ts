import { wrapRequestHandler } from "~/utils/error-handler"
import { searchController } from "./../controllers/searchs.controllers"
import { Router } from "express"
import { accessTokenValidator } from "~/middlewares/auth.middlewares"

const searchRouter = Router()

searchRouter.get("/", accessTokenValidator, wrapRequestHandler(searchController))

export default searchRouter
