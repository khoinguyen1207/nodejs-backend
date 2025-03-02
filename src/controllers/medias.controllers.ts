import { NextFunction, Request, Response } from "express"
import formidable from "formidable"
import path from "path"

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: path.resolve("uploads"),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 500 * 1024, // 500KB
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: "Image uploaded successfully",
    })
  })
}
