// Dependencies
require('dotenv').config()

export const serverPort = process.env.PORT || 5000
export const db = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}
