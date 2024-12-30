import { ObjectId } from "mongodb"
import { envConfig } from "~/constants/config"
import { TokenType } from "~/constants/enums"
import { RegisterReqBody } from "~/models/requests/User.request"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.services"
import { hashPassword } from "~/utils/crypto"
import { UnprocessableEntityError } from "~/utils/error-handler"
import { signToken } from "~/utils/jwt"

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
      },
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
      options: {
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      },
    })
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
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

  async login(email: string, password: string) {
    const user = await databaseService.users.findOne({ email: email, password: hashPassword(password) })
    if (!user) {
      throw new UnprocessableEntityError("Email or password is incorrect", { email: "Email or password is incorrect" })
    }
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
    const newRefreshToken = new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    await databaseService.refresh_tokens.insertOne(newRefreshToken)
    return { access_token, refresh_token }
  }
}

const userService = new UserService()
export default userService
