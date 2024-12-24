import { Router } from "express"
const usersRouter = Router()
import { loginController, registerController } from "~/controllers/users.controllers"
import { loginValidator, registerValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))

export default usersRouter
