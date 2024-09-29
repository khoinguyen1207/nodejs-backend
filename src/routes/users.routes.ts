import { Router } from 'express'
const usersRouter = Router()
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
