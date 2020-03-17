// Dependencies
import passport from 'passport'
import FacebookTokenStrategy from 'passport-facebook-token'
import { Strategy as GoogleTokenStrategy } from 'passport-google-oauth'

// Configuration
import { $fb, $gl } from '@config'

// FACEBOOK STRATEGY
const FacebookTokenStrategyCallback = (
  accessToken,
  refreshToken,
  profile,
  done
) =>
  done(null, {
    accessToken,
    refreshToken,
    profile
  })

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: $fb().clientId,
      clientSecret: $fb().clientSecret
    },
    FacebookTokenStrategyCallback
  )
)

// GOOGLE STRATEGY
const GoogleTokenStrategyCallback = (
  accessToken,
  refreshToken,
  profile,
  done
) =>
  done(null, {
    accessToken,
    refreshToken,
    profile
  })

passport.use(
  new GoogleTokenStrategy(
    {
      consumerKey: $gl().clientId,
      consumerSecret: $gl().clientSecret
    },
    GoogleTokenStrategyCallback
  )
)

// Promisified authenticate functions
const facebookAuth = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      'facebook-token',
      { session: false },
      (err, data, info) => {
        if (err) reject(err)

        resolve({ data, info })
      }
    )(req, res)
  })

const googleAuth = (req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      'google',
      {
        session: false,
        scope: [
          'https://www.googleapis.com/auth/plus.login',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      },
      (err, data, info) => {
        if (err) reject(err)

        resolve({ data, info })
      }
    )(req, res)
  })

export { facebookAuth, googleAuth }
