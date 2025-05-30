import { Request } from "express"
import Tweet from "~/models/schemas/Tweet.schema"
import { TokenPayload } from "~/types/jwt"

declare module "express" {
  interface Request {
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tweet?: Tweet
  }
}
