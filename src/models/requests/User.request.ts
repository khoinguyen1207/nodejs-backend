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

export interface UpdateProfileReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowReqBody {
  user_id: string
  followed_user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
