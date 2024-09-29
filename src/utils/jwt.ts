import jwt, { SignOptions } from "jsonwebtoken"
import { envConfig } from "~/constants/config"

interface SignTokenPayload {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}

export const signToken = ({
  payload,
  privateKey = envConfig.JWT_SECRET_KEY,
  options = {
    algorithm: "HS256",
  },
}: SignTokenPayload) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}
