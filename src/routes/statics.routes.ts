import { Router } from "express"
import { staticImageController, staticVideoController } from "~/controllers/statics.controllers"
const staticsRouter = Router()

staticsRouter.get("/images/:name", staticImageController)
staticsRouter.get("/videos/:name", staticVideoController)

export default staticsRouter
