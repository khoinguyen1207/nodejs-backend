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

export interface GoogleOauthTokenRes {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: string
  id_token: string
}

export interface GoogleOauthUserInfoRes {
  id: string
  email: string
  verified_email: true
  name: string
  given_name: string
  family_name: string
  picture: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
  user_id: string
}
