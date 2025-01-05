import { Router } from "express"
const usersRouter = Router()
import { emailVerificationController, loginController, logoutController, registerController } from "~/controllers/users.controllers"
import { accessTokenValidator, emailVerificationValidator, refreshTokenValidator } from "~/middlewares/auth.middlewares"
import { loginValidator, registerValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post("/email-verification", emailVerificationValidator, wrapRequestHandler(emailVerificationController))

export default usersRouter
