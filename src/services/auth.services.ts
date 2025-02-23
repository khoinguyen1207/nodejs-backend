import { envConfig } from "~/constants/config"
import { signToken } from "~/utils/jwt"
import { TokenType } from "~/constants/enums"
import { LoginReqBody, RegisterReqBody } from "~/models/requests/Auth.requests"
import { ObjectId } from "mongodb"
import databaseService from "~/services/database.services"
import User from "~/models/schemas/User.schema"
import { hashPassword } from "~/utils/crypto"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import { UnprocessableEntityError } from "~/utils/error-handler"

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

  async signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
      },
      secretOrPublicKey: envConfig.REFRESH_TOKEN_SECRET_KEY,
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
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
      authService.signAccessToken(user_id.toString()),
      authService.signRefreshToken(user_id.toString()),
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
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([authService.signAccessToken(user_id), authService.signRefreshToken(user_id)])
    const newRefreshToken = new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return Boolean(result)
  }
}

const authService = new AuthService()
export default authService
