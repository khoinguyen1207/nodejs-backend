import { Router } from "express"
import { uploadImageController } from "~/controllers/medias.controllers"
const mediasRouter = Router()

mediasRouter.post("/upload-image", uploadImageController)

export default mediasRouter
