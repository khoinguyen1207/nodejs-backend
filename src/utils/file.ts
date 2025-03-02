import fs from "fs"
import path from "path"

export function initUploadsFolder() {
  const uploadsFolderPath = path.resolve("uploads")
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true, // Create parent directories when necessary
    })
  }
}
