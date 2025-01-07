import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services"
import { TokenPayload } from "~/types/jwt"

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const result = await userService.login({ email, password })
  res.status(200).json({
    message: "Login successful!",
    data: result,
  })
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await userService.register(req.body)
  res.json({
    message: "Registration successful!",
    data: result,
  })
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.json({
    message: "Logout successful!",
    data: result,
  })
}

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const result = await userService.verifyEmail(user_id)
  res.json({
    message: result,
    data: true,
  })
}

export const sendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.sendVerifyEmail(user_id)
  res.json({
    message: result,
    data: true,
  })
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body
  const result = await userService.forgotPassword(email)
  res.json({
    message: result,
    data: true,
  })
}
