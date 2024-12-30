import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { envConfig } from "~/constants/config"
import { DefaultError, UnauthorizedError } from "~/utils/error-handler"

interface SignTokenPayload {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}

interface VerifyTokenPayload {
  token: string
  secretOrPublicKey?: string
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

export const verifyToken = ({ token, secretOrPublicKey = envConfig.JWT_SECRET_KEY }: VerifyTokenPayload) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(new UnauthorizedError(error.message, error))
      }
      resolve(decoded as JwtPayload)
    })
  })
}
