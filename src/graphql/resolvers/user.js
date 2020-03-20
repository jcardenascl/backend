// Dependencies
import { PubSub } from 'apollo-server-express'

// Error Handler
import errorHandler from '@lib/errorHandler'

// Utils
import { doLogin, createToken } from '@utils/auth'
import {
  facebookAuth as authFacebook,
  googleAuth as authGoogle
} from '@utils/passport'

const pubsub = new PubSub()

// ACTIONS
const USER_UPDATED = 'USER_UPDATED'

export default {
  Query: {
    currentUser: (_, args, { user: auth, models: { User } }) => {
      // this if statement is our authentication check
      if (!auth) {
        errorHandler('Not authorized', 'You must be logged in')
      }

      return User.findById(auth.id).populate('transactions')
    },
    users: async (_, args, { models: { User } }) => {
      let users

      try {
        users = await User.find().populate('transactions')
      } catch (err) {
        errorHandler(err)
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
    updateUser: async (
      _,
      { userId, input },
      { user: auth, models: { User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let user

      try {
        user = await User.findById({ _id: auth.id })
      } catch (error) {
        errorHandler(error)
      }

      if (auth.id !== userId) {
        errorHandler('Not authorized', 'You must be logged in')
      }

      try {
        user = await User.findOneAndUpdate(
          { _id: auth.id },
          { $set: input },
          { new: true, useFindAndModify: false }
        )
      } catch (err) {
        errorHandler(err, 'An error has ocurred, please try again')
      }

      pubsub.publish(USER_UPDATED, user)
      return user
    },
    login: (parent, { input: { email, password } }, { models }) => {
      return doLogin(email, password, models)
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
          const [token] = await createToken(user)

          if (user) {
            return {
              name: `${user.firstName} ${user.lastName}`,
              token
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
          const [token] = await createToken(user)

          if (user) {
            return {
              name: `${user.firstName} ${user.lastName}`,
              token
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
