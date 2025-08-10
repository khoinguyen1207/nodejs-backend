import sharp from "sharp"
import path from "path"
import fs from "fs"
import { getNameWithoutExtension, handleUploadImage, handleUploadVideo } from "~/utils/file"
import { Request } from "express"
import { UPLOAD_IMAGE_DIR } from "~/constants/dir"
import { envConfig } from "~/constants/config"
import { MediaType } from "~/types/enums"
import { uploadFileToS3 } from "~/utils/s3"
import fsPromises from "fs/promises"

class MediaService {
  async handleUploadImages(req: Request) {
    const files = await handleUploadImage(req)

    // Convert the image to JPEG format and save it to the upload directory
    const result = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameWithoutExtension(file.newFilename)
        const newFullFileName = `${newFileName}.jpeg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)

        const mime = await import("mime")

        const uploadResult = await uploadFileToS3({
          filename: newFullFileName,
          filepath: newPath,
          contentType: mime.default.getType(newPath) || "image/jpeg",
        })

        // Delete the original file
        await Promise.all([fsPromises.unlink(file.filepath), fsPromises.unlink(newPath)])
        return {
          url: uploadResult.Location,
          type: MediaType.IMAGE,
        }
      }),
    )
    return result
  }

  async handleUploadVideos(req: Request) {
    const files = await handleUploadVideo(req)
    const result = files.map((file) => {
      return {
        url: `${envConfig.HOST}/statics/videos/${file.newFilename}`,
        type: MediaType.VIDEO,
      }
    })
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
