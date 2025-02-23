import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services"
import { TokenPayload } from "~/types/jwt"

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  await userService.verifyEmail(user_id)
  res.json({
    message: "Verify email successfully!",
    data: true,
  })
}

export const sendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await userService.sendVerifyEmail(user_id)
  res.json({
    message: "Send verify email successfully!",
    data: true,
  })
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body
  await userService.forgotPassword(email)
  res.json({
    message: "Forgot password email sent successfully. Please check your email",
    data: true,
  })
}

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password, forgot_password_token } = req.body
  await userService.resetPassword(user_id, password, forgot_password_token)
  res.json({
    message: "Reset password successfully!",
    data: true,
  })
}

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getProfile(user_id)
  res.json({
    message: "Get profile successfully!",
    data: result,
  })
}

export const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.updateProfile(user_id, req.body)
  res.json({
    message: "Update profile successfully!",
    data: result,
  })
}

export const getUserInfoController = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params
  const result = await userService.getUserInfo(username)
  res.json({
    message: "Get user info successfully!",
    data: result,
  })
}

export const followController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  await userService.follow({ user_id, followed_user_id })
  res.json({
    message: "User followed successfully!",
    data: true,
  })
}

export const unFollowController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  await userService.unFollow({ user_id, followed_user_id })
  res.json({
    message: "Unfollow user successfully!",
    data: true,
  })
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await userService.changePassword(user_id, req.body)
  res.json({
    message: "Change password successfully!",
    data: true,
  })
}
