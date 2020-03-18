// Error Handler
import errorHandler from '@lib/errorHandler'

// Login
// import { doLogin } from '@utils/auth'
import {
  facebookAuth as authFacebook,
  googleAuth as authGoogle
} from '@utils/passport'

export default {
  Query: {
    currentUser: (_, args, { user: auth, models: { User } }) => {
      // this if statement is our authentication check
      if (!auth) {
        errorHandler(null, 'Not Authenticated')
      }

      return User.find({ _id: auth.id })
    },
    users: async (_, args, { models: { User } }) => {
      let users

      try {
        users = await User.find().populate('transactions')
      } catch (error) {
        errorHandler(error)
      }

      return users
    }
  },
  Mutation: {
    user: async (_, { input }, { models: { User } }) => {
      let user

      try {
        user = await User.create({ ...input })
      } catch (error) {
        if (error.code === 11000) {
          if (error.keyPattern.username) {
            errorHandler(error.errmsg, 'Username is already taken')
          }

          if (error.keyPattern.email) {
            errorHandler(error.errmsg, 'Email is already taken')
          }
        } else {
          errorHandler(error, error.errors)
        }
      }

      return user
    },
    facebookAuth: async (
      _,
      { input: { accessToken } },
      { req, res, models: { User } }
    ) => {
      req.body = {
        ...req.body,
        access_token: accessToken
      }

      try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authFacebook(req, res)

        if (data) {
          const user = await User.upsertFbUser(data)

          if (user) {
            return {
              name: `${user.firstName} ${user.lastName}`,
              token: user.generateJWT()
            }
          }
        }

        if (info) {
          console.log(info)
          switch (info.code) {
            case 'ETIMEDOUT':
              return new Error('Failed to reach Facebook: Try Again')
            default:
              return new Error('Something went wrong')
          }
        }

        return Error('Server error')
      } catch (error) {
        return error
      }
    },
    googleAuth: async (
      _,
      { input: { accessToken } },
      { req, res, models: { User } }
    ) => {
      req.body = {
        ...req.body,
        access_token: accessToken
      }

      try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authGoogle(req, res)

        if (data) {
          const user = await User.upsertGoogleUser(data)

          if (user) {
            return {
              name: `${user.firstName} ${user.lastName}`,
              token: user.generateJWT()
            }
          }
        }

        if (info) {
          console.log(info)
          switch (info.code) {
            case 'ETIMEDOUT':
              return new Error('Failed to reach Google: Try Again')
            default:
              return new Error('Something went wrong')
          }
        }

        return Error('server error')
      } catch (error) {
        return error
      }
    }
  }
}
