import { Router } from 'express'
const usersRouter = Router()
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidation } from '~/middlewares/users.middlewares'

usersRouter.post('/login', loginValidation, loginController)
usersRouter.post('/register', loginValidation, registerController)

export default usersRouter
