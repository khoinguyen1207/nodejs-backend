import jwt, { JwtPayload } from "jsonwebtoken"
import { SignTokenPayload, VerifyTokenPayload } from "~/types/jwt"

export const signToken = ({
  payload,
  secretOrPublicKey,
  options = {
    algorithm: "HS256",
  },
}: SignTokenPayload) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secretOrPublicKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: VerifyTokenPayload) => {
  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        reject(error)
      }
      resolve(decoded as JwtPayload)
    })
  })
}
