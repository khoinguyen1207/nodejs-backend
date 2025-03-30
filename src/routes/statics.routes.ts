import { Router } from "express"
import { staticFileController } from "~/controllers/statics.controllers"
const staticsRouter = Router()

staticsRouter.get("/:name", staticFileController)

export default staticsRouter
