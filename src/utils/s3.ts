import fs from "fs"
import { S3 } from "@aws-sdk/client-s3"
import { envConfig } from "~/constants/config"
import { Upload } from "@aws-sdk/lib-storage"

const s3 = new S3({
  region: envConfig.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
  },
})

export const uploadFileToS3 = async ({ filename, filepath, contentType }: { filename: string; filepath: string; contentType: string }) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: "nodejs-backend-ap-southeast-1", Key: filename, Body: fs.readFileSync(filepath), ContentType: contentType },
    // (optional) concurrency configuration
    queueSize: 4,
    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,
    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false,
  })

  return parallelUploads3.done()
}
