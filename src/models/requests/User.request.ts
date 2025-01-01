export interface RegisterReqBody {
  email: string
  password: string
  confirm_password: string
  name: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}
