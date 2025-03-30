import { Router } from "express"
const authRouter = Router()

import { loginController, logoutController, oauthController, registerController } from "~/controllers/auths.controllers"
import { wrapRequestHandler } from "~/utils/error-handler"
import {
  accessTokenValidator,
  filterMiddleware,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
} from "~/middlewares/auth.middlewares"

authRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
authRouter.post(
  "/register",
  registerValidator,
  filterMiddleware(["email", "password", "confirm_password", "name", "date_of_birth"]),
  wrapRequestHandler(registerController),
)
authRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
authRouter.post("/oauth/google", wrapRequestHandler(oauthController))

export default authRouter
