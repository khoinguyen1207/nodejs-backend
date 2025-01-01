import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services"

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
