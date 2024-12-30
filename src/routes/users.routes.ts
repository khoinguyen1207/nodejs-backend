import { Router } from "express"
const usersRouter = Router()
import { loginController, registerController } from "~/controllers/users.controllers"
import { accessTokenValidator } from "~/middlewares/auth.middlewares"
import { loginValidator, registerValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/error-handler"

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController))
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController))
usersRouter.post(
  "/logout",
  accessTokenValidator,
  wrapRequestHandler((req, res) => {
    console.log(req.headers)
    res.json({ message: "Logout successful!" })
  }),
)

export default usersRouter
