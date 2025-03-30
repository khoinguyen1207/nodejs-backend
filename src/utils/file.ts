import { Request } from "express"
import formidable, { File } from "formidable"
import fs from "fs"
import { UPLOAD_IMAGE_DIR_TEMP, UPLOAD_VIDEO_DIR } from "~/constants/dir"
import { BadRequestError } from "~/utils/error-handler"

export function initUploadsFolder() {
  ;[UPLOAD_IMAGE_DIR_TEMP, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true, // Create parent directories when necessary
      })
    }
  })
}

export function getNameWithoutExtension(fullname: string) {
  const nameArray = fullname.split(".")
  nameArray.pop()
  return nameArray.join("")
}

export function handleUploadImage(req: Request) {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_DIR_TEMP,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 500 * 1024, // 500KB
    maxTotalFileSize: 500 * 1024 * 4,
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === "image" && Boolean(mimetype?.includes("image"))
      if (!valid) {
        form.emit("error" as any, new BadRequestError("Invalid file type") as any)
      }
      return valid
    },
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log("files", files)
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new BadRequestError("File not found"))
      }
      resolve(files.image)
    })
  })
}

export function handleUploadVideo(req: Request) {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: ({ name, originalFilename, mimetype }) => {
      return true
    },
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log("files", files)
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(new BadRequestError("File not found"))
      }
      resolve(files.video)
    })
  })
}
