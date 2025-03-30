import { Router } from "express"
import { uploadImagesController, uploadVideosController } from "~/controllers/medias.controllers"
import { wrapRequestHandler } from "~/utils/error-handler"
const mediasRouter = Router()

mediasRouter.post("/upload-images", wrapRequestHandler(uploadImagesController))
mediasRouter.post("/upload-videos", wrapRequestHandler(uploadVideosController))

export default mediasRouter
