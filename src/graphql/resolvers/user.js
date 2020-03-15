// Error Handler
import errorHandler from '@lib/errorHandler'

// Login
import { doLogin } from '@utils/auth'

export default {
  Query: {
    currentUser: (_, args, context) => context.getUser(),
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
    login: (_, { input: { email, password } }, { models }) => {
      return doLogin(email, password, models)
    },
    logout: (_, args, context) => context.logout()
  }
}
