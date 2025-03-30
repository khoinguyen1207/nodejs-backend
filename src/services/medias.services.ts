import sharp from "sharp"
import path from "path"
import fs from "fs"
import { getNameWithoutExtension, handleUploadImage } from "~/utils/file"
import { Request } from "express"
import { UPLOAD_DIR } from "~/constants/dir"
import { envConfig } from "~/constants/config"
import { MediaType } from "~/types/medias"

class MediaService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)

    // Convert the image to JPEG format and save it to the upload directory
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameWithoutExtension(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpeg`)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)

        // Delete the original file
        fs.unlinkSync(file.filepath)
        return {
          url: `${envConfig.HOST}/images/${newName}.jpeg`,
          type: MediaType.IMAGE,
        }
      }),
    )
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
