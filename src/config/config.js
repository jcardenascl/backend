// Dependencies
require('dotenv').config()

export const serverPort = process.env.PORT || 5000
export const cors = {
  origin: process.env.CORS
}
export const db = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}
export const security = {
  secretKey: process.env.SECRET_KEY,
  expiresIn: process.env.EXPIRES_IN
}
export const fb = {
  clientId: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackUrl: process.env.FACEBOKK_CALLBACK_URL
}
export const gl = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
}
export const auth0 = {
  audience: process.env.AUTH0_AUDIENCE,
  url: process.env.AUTH0_URL
}
