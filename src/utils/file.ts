import { Request } from "express"
import formidable from "formidable"
import fs from "fs"
import path from "path"
import { BadRequestError } from "~/utils/error-handler"

export function initUploadsFolder() {
  const uploadsFolderPath = path.resolve("uploads")
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true, // Create parent directories when necessary
    })
  }
}

export function handleUploadSingleImage(req: Request) {
  const form = formidable({
    uploadDir: path.resolve("uploads"),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 500 * 1024, // 500KB
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === "image" && Boolean(mimetype?.includes("image"))
      if (!valid) {
        form.emit("error" as any, new BadRequestError("Invalid file type.") as any)
      }
      return valid
    },
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log("fields", fields)
      console.log("files", files)
      if (err) {
        reject(err)
      }
      const uploadFile = files.image as any
      if (!uploadFile) {
        reject(new BadRequestError("File not found"))
      }
      resolve(files)
    })
  })
}
