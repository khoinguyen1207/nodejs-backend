import { envConfig } from "~/constants/config"
import { TokenType } from "~/constants/enums"
import { RegisterReqBody } from "~/models/requests/User.request"
import { User } from "~/models/schemas/User.schema"
import databaseService from "~/services/database.services"
import { hashPassword } from "~/utils/crypto"
import { ErrorWithStatus } from "~/utils/error-handler"
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

  async createUser(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
    return { access_token, refresh_token }
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async login(email: string, password: string) {
    const user = await databaseService.users.findOne({ email: email, password: hashPassword(password) })
    if (!user) {
      throw new ErrorWithStatus("Email or password is incorrect", 422)
    }
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
    return { access_token, refresh_token }
  }
}

const userService = new UserService()
export default userService
