import { envConfig } from "~/constants/config"
import { signToken } from "~/utils/jwt"
import { TokenType } from "~/types/enums"
import { LoginReqBody, RefreshTokenReqBody, RegisterReqBody } from "~/models/requests/Auth.requests"
import { ObjectId } from "mongodb"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import { hashPassword } from "~/utils/crypto"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import { BadRequestError, UnprocessableEntityError } from "~/utils/error-handler"
import { client } from "~/utils/oauth"
import { capitalize } from "lodash"
import { logger } from "~/constants/logging"

class AuthService {
  async signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
      secretOrPublicKey: envConfig.ACCESS_TOKEN_SECRET_KEY,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      },
    })
  }

  async signRefreshToken(user_id: string, exp?: number) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        ...(exp ? { exp } : {}),
      },
      secretOrPublicKey: envConfig.REFRESH_TOKEN_SECRET_KEY,
      options: {
        ...(exp ? {} : { expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN }),
      },
    })
  }

  async signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
      },
      secretOrPublicKey: envConfig.EMAIL_VERIFICATION_SECRET_KEY,
      options: {
        expiresIn: "5m",
      },
    })
  }

  async signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
      },
      secretOrPublicKey: envConfig.FORGOT_PASSWORD_SECRET_KEY,
      options: {
        expiresIn: "5m",
      },
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    )
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString()),
    ])
    const newRefreshToken = new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }

  async login(payload: LoginReqBody) {
    const user = await databaseService.users.findOne({ email: payload.email, password: hashPassword(payload.password) })
    if (!user) {
      throw new UnprocessableEntityError("Email or password is incorrect", { email: "Email or password is incorrect" })
    }
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user._id.toString()),
      this.signRefreshToken(user._id.toString()),
    ])
    const newRefreshToken = new RefreshToken({ user_id: user._id, token: refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return Boolean(result)
  }

  async refreshToken({ refresh_token, user_id, exp }: RefreshTokenReqBody) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id, exp),
      databaseService.refresh_tokens.deleteOne({ token: refresh_token }),
    ])
    const newRefreshToken = new RefreshToken({ user_id: new ObjectId(user_id), token: new_refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)

    return { access_token: new_access_token, refresh_token: new_refresh_token }
  }

  // private async getGoogleOauthToken(code: string) {
  //   const body = {
  //     code,
  //     client_id: envConfig.GOOGLE_CLIENT_ID,
  //     client_secret: envConfig.GOOGLE_CLIENT_SECRET,
  //     redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
  //     grant_type: "authorization_code",
  //   }

  //   const { data } = await axios.post("https://oauth2.googleapis.com/token", body, {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //   })
  //   console.log(data)
  //   return data as GoogleOauthTokenRes
  // }

  // private async getGoogleUserInfo(access_token: string) {
  //   const { data } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
  //     params: {
  //       alt: "json",
  //     },
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //     },
  //   })
  //   console.log(data)
  //   return data as GoogleOauthUserInfoRes
  // }

  private async getOauthToken(code: string) {
    try {
      const { tokens } = await client.getToken(code)
      return tokens
    } catch (error: any) {
      throw new BadRequestError(capitalize(error.response.data.error))
    }
  }

  async oauthGoogle(code: string) {
    if (!code) throw new BadRequestError("Code is required")

    // Get token from code and verify id token
    const tokens = await this.getOauthToken(code)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: envConfig.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) throw new BadRequestError("Invalid token")
    const { email, email_verified, name } = payload

    // Check if email is verified
    if (!email_verified) throw new BadRequestError("Email is not verified")

    // Check if user exists, if not, create new user
    const user = await databaseService.users.findOne({ email })
    const user_id = user ? user._id : new ObjectId()
    if (!user) {
      const password = hashPassword(Math.random().toString(36).substring(2, 10))
      await databaseService.users.insertOne(
        new User({
          _id: user_id,
          email: email!,
          password: password,
          username: `user${user_id.toString()}`,
          name: name!,
        }),
      )
    }

    // Generate tokens
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString()),
    ])
    const newRefreshToken = new RefreshToken({ user_id: user_id, token: refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }
}

const authService = new AuthService()
export default authService
