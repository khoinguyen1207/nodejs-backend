import { Router } from "express"
const usersRouter = Router()
import { loginController, logoutController, registerController } from "~/controllers/users.controllers"
import { accessTokenValidator, refreshTokenValidator } from "~/middlewares/auth.middlewares"
import { loginValidator, registerValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default usersRouter
