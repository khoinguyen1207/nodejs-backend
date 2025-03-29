import { getNameWithoutExtension, handleUploadSingleImage } from "~/utils/file"
import { Request } from "express"
import sharp from "sharp"
import path from "path"
import { UPLOAD_DIR } from "~/constants/dir"
import fs from "fs"

class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)

    // Convert the image to JPEG format and save it to the upload directory
    const newName = getNameWithoutExtension(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpeg`)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath)

    // Delete the original file
    fs.unlinkSync(file.filepath)
    return `/uploads/${newName}.jpeg`
  }
}

const mediaService = new MediaService()
export default mediaService
