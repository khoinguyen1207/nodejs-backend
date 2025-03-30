import path from "path"
import { NextFunction, Request, Response } from "express"
import { UPLOAD_DIR } from "~/constants/dir"

export const staticFileController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  if (!name) {
    return res.status(400).json({ message: "File name is required" })
  }
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      return res.status(404).json({ message: "File not found" })
    }
  })
}
