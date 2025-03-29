import { NextFunction, Request, Response } from "express"
import mediaService from "~/services/medias.services"

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleUploadSingleImage(req)
  res.json({
    message: "Upload image successfully",
    data: result,
  })
}
