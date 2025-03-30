import { NextFunction, Request, Response } from "express"
import mediaService from "~/services/medias.services"

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadImages(req)
  res.json({
    message: "Upload images successfully",
    data: result,
  })
}

export const uploadVideosController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadVideos(req)
  res.json({
    message: "Upload videos successfully",
    data: result,
  })
}
