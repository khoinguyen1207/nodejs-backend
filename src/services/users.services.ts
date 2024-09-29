import { User } from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'

class UserService {
  async createUser(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await databaseService.users.insertOne(new User({ email, password }))
    return result
  }

  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }
}

const userService = new UserService()
export default userService
