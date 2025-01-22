import { envConfig } from "~/constants/config"
import { signToken } from "~/utils/jwt"
import { TokenType } from "~/constants/enums"

class AuthService {
  public signAccessToken(user_id: string) {
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

  public signRefreshToken(user_id: string) {
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

  public signEmailVerifyToken(user_id: string) {
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

  public signForgotPasswordToken(user_id: string) {
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
}

const authService = new AuthService()
export default authService
