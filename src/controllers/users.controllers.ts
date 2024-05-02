import { Request, Response } from 'express'
import userService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
    const { email, password } = req.body
    if (email === 'khoinguyen@gmail.com' && password === '123456') {
        return res.status(200).json({ message: 'Login success' })
    }
    return res.status(400).json({ message: 'Login failed' })
}

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const result = await userService.register({ email, password })
        res.json({
            message: 'Register success',
            data: result
        })
    } catch (error) {
        res.status(400).json({ message: 'Register failed' })
    }
}
