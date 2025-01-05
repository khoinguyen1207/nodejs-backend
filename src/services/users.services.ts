import { ObjectId } from "mongodb"
import { envConfig } from "~/constants/config"
import { TokenType, UserVerifyStatus } from "~/constants/enums"
import { LoginReqBody, RegisterReqBody } from "~/models/requests/User.request"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.services"
import { hashPassword } from "~/utils/crypto"
import { NotFoundError, UnprocessableEntityError } from "~/utils/error-handler"
import { signToken } from "~/utils/jwt"

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
      secretOrPublicKey: envConfig.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      },
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
      },
      secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      },
    })
  }
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
      },
      secretOrPublicKey: envConfig.JWT_SECRET_EMAIL_VERIFICATION,
      options: {
        expiresIn: "7d",
      },
    })
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async checkRefreshTokenExist(refresh_token: string) {
    const result = await databaseService.refresh_tokens.findOne({ token: refresh_token })
    return Boolean(result)
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
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
    const [access_token, refresh_token, email_verify_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
      this.signEmailVerifyToken(user_id),
    ])
    const newRefreshToken = new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    await databaseService.users.updateOne({ _id: user._id }, { $set: { email_verify_token } })

    console.log("verify", email_verify_token)
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return Boolean(result)
  }

  async verifyEmail(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new NotFoundError("User not found", { email_verify_token: "User not found" })
    }
    if (user.email_verify_token === "") {
      return "Email already verified before"
    }
    await databaseService.users.updateOne({ _id: user._id }, { $set: { email_verify_token: "", verify: UserVerifyStatus.Verified } })
    return "Email verified successfully"
  }
}

const userService = new UserService()
export default userService
