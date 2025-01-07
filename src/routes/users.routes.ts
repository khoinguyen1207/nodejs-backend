import { Router } from "express"
const usersRouter = Router()
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  sendVerifyEmailController,
} from "~/controllers/users.controllers"
import { accessTokenValidator, refreshTokenValidator } from "~/middlewares/auth.middlewares"
import { loginValidator, registerValidator, verifyEmailValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post("/verify-email", verifyEmailValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(sendVerifyEmailController))

export default usersRouter
