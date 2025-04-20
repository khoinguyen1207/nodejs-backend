import { NextFunction, Request, Response } from "express"
import authService from "~/services/auths.services"
import { TokenPayload } from "~/types/jwt"

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const result = await authService.login({ email, password })
  res.status(200).json({
    message: "Login successful!",
    data: result,
  })
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await authService.register(req.body)
  res.json({
    message: "Registration successful!",
    data: result,
  })
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body
  const result = await authService.logout(refresh_token)
  res.json({
    message: "Logout successful!",
    data: result,
  })
}

export const oauthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body
  const result = await authService.oauthGoogle(code as string)
  res.json({
    message: "Login successful!",
    data: result,
  })
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body
  const { user_id, exp } = req.decoded_refresh_token as TokenPayload
  const result = await authService.refreshToken({
    refresh_token,
    user_id,
    exp,
  })
  res.json({
    message: "Refresh token successful!",
    data: result,
  })
}
