import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services"
import { ParamsDictionary } from "express-serve-static-core"
import { RegisterReqBody } from "~/models/requests/User.request"

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const result = await userService.login(email, password)
  res.status(200).json({
    message: "Login successful!",
    data: result,
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  const result = await userService.register(req.body)
  res.json({
    message: "Register successful!",
    data: result,
  })
}
