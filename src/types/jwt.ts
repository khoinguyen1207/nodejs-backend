import { JwtPayload, SignOptions } from "jsonwebtoken"
import { TokenType } from "~/types/enums"

export interface SignTokenPayload {
  payload: string | Buffer | object
  secretOrPublicKey: string
  options?: SignOptions
}

export interface VerifyTokenPayload {
  token: string
  secretOrPublicKey: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
