// Error Handler
import errorHandler from '@lib/errorHandler'

export default {
  Query: {
    transactions: async (
      _,
      { user },
      { user: auth, models: { Transaction } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transactions

      try {
        transactions = await Transaction.find({ user }).populate(
          'user',
          'id firstName lastName username email'
        )
      } catch (error) {
        errorHandler(error)
      }

      return transactions
    },
    transaction: async (
      _,
      { user, id },
      { user: auth, models: { Transaction } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction

      try {
        transaction = await Transaction.findOne({ _id: id, user }).populate(
          'user',
          'id firstName lastName username email'
        )
      } catch (error) {
        errorHandler(error)
      }

      return transaction
    }
  },
  Mutation: {
    transaction: async (
      _,
      { user: userId, input },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById({ _id: userId })
      } catch (error) {
        errorHandler(error)
      }

      if (user) {
        try {
          transaction = await Transaction.create(input)

          await User.findOneAndUpdate(
            { _id: userId },
            { $push: { transactions: transaction._id } },
            { new: true }
          )
        } catch (error) {
          errorHandler(error)
        }
      }

      return null
    },
    updateTransaction: async (
      _,
      { user: userId, id, input },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById({ _id: userId })
      } catch (error) {
        errorHandler(error)
      }

      if (user) {
        try {
          transaction = await Transaction.findOneAndUpdate(
            { _id: id },
            { $set: input },
            { new: true, useFindAndModify: false }
          )
        } catch (error) {
          errorHandler(error)
        }

        return transaction
      }

      return null
    },
    deleteTransaction: async (
      _,
      { user: userId, id },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById({ _id: userId })
      } catch (error) {
        errorHandler(error)
      }

      if (user) {
        try {
          transaction = await Transaction.findOneAndDelete({ _id: id })
        } catch (error) {
          errorHandler(error)
        }

        return transaction !== null
          ? `Transaction:${id} deleted successfully`
          : `Transaction:${id} didn't exist`
      }

      return "You don't have permissions to make this operation"
    }
  }
}
