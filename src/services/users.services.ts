import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enums"
import { LoginReqBody, RegisterReqBody, UpdateProfileReqBody } from "~/models/requests/User.request"
import RefreshToken from "~/models/schemas/RefreshToken.schema"
import User from "~/models/schemas/User.schema"
import authService from "~/services/auth.services"
import databaseService from "~/services/database.services"
import { hashPassword } from "~/utils/crypto"
import { BadRequestError, NotFoundError, UnprocessableEntityError } from "~/utils/error-handler"

class UserService {
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  // Check refresh token exist
  async checkRefreshTokenExist(refresh_token: string) {
    const result = await databaseService.refresh_tokens.findOne({ token: refresh_token })
    return Boolean(result)
  }

  // Register user
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

  async verifyEmail(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new NotFoundError("User not found")
    }
    if (user.verify === UserVerifyStatus.Verified) {
      return "Email already verified before"
    }
    await databaseService.users.updateOne(
      { _id: user._id },
      {
        $set: { email_verify_token: "", verify: UserVerifyStatus.Verified },
        $currentDate: {
          updated_at: true,
        },
      },
    )
    return true
  }

  async sendVerifyEmail(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new NotFoundError("User not found")
    }
    if (user.verify === UserVerifyStatus.Verified) {
      throw new BadRequestError("Email already verified before")
    }

    // Check time between last send email and now is greater than 1 minute
    const last_send_email = new Date(user.updated_at).getTime()
    const now = Date.now()
    if (now - last_send_email < 60000) {
      throw new BadRequestError("Please wait 1 minute before sending another email")
    }
    const email_verify_token = await authService.signEmailVerifyToken(user_id)
    console.log("send email: ", email_verify_token)
    await databaseService.users.updateOne({ _id: user._id }, { $set: { email_verify_token }, $currentDate: { updated_at: true } })
    return true
  }

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check time between last send email and now is greater than 1 minute
    const last_send_forgot_password_token = new Date(user.updated_at).getTime()
    const now = Date.now()
    if (now - last_send_forgot_password_token < 60000) {
      throw new BadRequestError("Please wait 1 minute before sending another email")
    }
    const forgot_password_token = await authService.signForgotPasswordToken(user._id.toString())
    await databaseService.users.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          forgot_password_token,
        },
        $currentDate: {
          updated_at: true,
        },
      },
    )
    console.log("Sent email forgot password: ", forgot_password_token)
    return true
  }

  async resetPassword(user_id: string, password: string, forgot_password_token: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), forgot_password_token })
    if (!user) {
      throw new BadRequestError("User not found or forgot password token is invalid")
    }
    await databaseService.users.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: "",
        },
        $currentDate: {
          updated_at: true,
        },
      },
    )
    return true
  }

  async getProfile(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    )
    if (!user) {
      throw new NotFoundError("User not found")
    }
    return user
  }

  async updateProfile(user_id: string, body: UpdateProfileReqBody) {
    const payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : body
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(payload as UpdateProfileReqBody & { date_of_birth?: Date }),
        },
        $currentDate: {
          updated_at: true,
        },
      },
      {
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    )
    return user
  }

  async getUserInfo(username: string) {
    const user = await databaseService.users.findOne(
      {
        username,
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0,
          email: 0,
        },
      },
    )
    if (!user) {
      throw new NotFoundError("User not found")
    }
    return user
  }
}

const userService = new UserService()
export default userService
