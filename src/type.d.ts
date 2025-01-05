import { Request } from "express"
import { TokenPayload } from "~/types/jwt"

declare module "express" {
  interface Request {
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
