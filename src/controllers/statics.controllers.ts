import path from "path"
import { NextFunction, Request, Response } from "express"
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir"

export const staticImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  if (!name) {
    return res.status(400).json({ message: "File name is required" })
  }
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err && !res.headersSent) {
      console.log("error", err)
      res.status(404).send("Image not found")
    }
  })
}

export const staticVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  if (!name) {
    return res.status(400).json({ message: "File name is required" })
  }
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err && !res.headersSent) {
      console.log("error", err)
      res.status(404).send("Video not found")
    }
  })
}
