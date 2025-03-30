import { NextFunction, Request, Response } from "express"
import mediaService from "~/services/medias.services"

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadImage(req)
  res.json({
    message: "Upload images successfully",
    data: result,
  })
}
