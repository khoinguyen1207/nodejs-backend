import path from "path"
import { NextFunction, Request, Response } from "express"
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from "~/constants/dir"
import fs from "fs"
import { httpStatus } from "~/constants/httpStatus"

export const staticImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  if (!name) {
    return res.status(400).json({ message: "File name is required" })
  }
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      console.log("error", err)
      res.status(404).send("Image not found")
    }
  })
}

export const staticVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const range = req.headers.range
  if (!range) {
    return res.status(400).send("Request requires Range header")
  }
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size
  const mime = await import("mime")
  const contentType = mime.default.getType(videoPath) || "video/mp4"
  const chunkSize = 10 ** 6 // 2MB
  const start = Number(range.replace(/\D/g, ""))
  const end = Math.min(start + chunkSize, videoSize - 1)
  const contentLength = end - start + 1

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": contentType,
  }

  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
