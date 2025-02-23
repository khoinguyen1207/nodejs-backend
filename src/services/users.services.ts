import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enums"
import { ChangePasswordReqBody, FollowReqBody, UpdateProfileReqBody } from "~/models/requests/User.request"
import Follower from "~/models/schemas/Follower.schema"
import authService from "~/services/auth.services"
import databaseService from "~/services/database.services"
import { hashPassword } from "~/utils/crypto"
import { BadRequestError, NotFoundError } from "~/utils/error-handler"

class UserService {
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async checkUserExist(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new NotFoundError("User not found")
    }
    return user
  }

  // Check refresh token exist
  async checkRefreshTokenExist(refresh_token: string) {
    const result = await databaseService.refresh_tokens.findOne({ token: refresh_token })
    return Boolean(result)
  }

  async verifyEmail(user_id: string) {
    const user = await this.checkUserExist(user_id)
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
    const user = await this.checkUserExist(user_id)
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

  async follow(payload: FollowReqBody) {
    const { user_id, followed_user_id } = payload
    const user = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    })
    if (user) return true
    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id),
      }),
    )
    return true
  }

  async unFollow({ user_id, followed_user_id }: FollowReqBody) {
    const user = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    })
    if (!user) {
      throw new BadRequestError("Already unfollowed")
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    })
    return true
  }

  async changePassword(user_id: string, payload: ChangePasswordReqBody) {
    const user = await this.checkUserExist(user_id)
    if (user.password !== hashPassword(payload.old_password)) {
      throw new BadRequestError("Old password not match")
    }

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          password: hashPassword(payload.password),
        },
        $currentDate: {
          updated_at: true,
        },
      },
    )
    return true
  }
}

const userService = new UserService()
export default userService
