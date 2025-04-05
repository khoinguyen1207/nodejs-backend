import { OAuth2Client } from "google-auth-library"
import { envConfig } from "~/constants/config"

export const client = new OAuth2Client({
  clientId: envConfig.GOOGLE_CLIENT_ID,
  clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
  redirectUri: envConfig.GOOGLE_REDIRECT_URI,
})
