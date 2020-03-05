// Error Handler
import errorHandler from '@lib/errorHandler'

export default {
  Query: {
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
        errorHandler(error)
      }

      return user
    }
  }
}
