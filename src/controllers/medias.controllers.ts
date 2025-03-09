import { NextFunction, Request, Response } from "express"
import { handleUploadSingleImage } from "~/utils/file"

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadSingleImage(req)
  res.json({
    message: "Image uploaded successfully",
    data,
  })
}
