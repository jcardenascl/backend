// Error Handler
import errorHandler from '@lib/errorHandler'

export default {
  Query: {
    transactions: async (
      _,
      { options = {} },
      { user, models: { Transaction } }
    ) => {
      if (!user) return errorHandler('Not authorized', 'You must be logged in')

      let transactions
      const {
        orderBy = 'createdAt',
        direction = 'desc',
        limit = false,
        offset = false
      } = options

      const args = {}

      if (limit > 0) {
        args.limit = limit
      }

      if (offset > 0) {
        args.offset = offset
      }

      console.log(`${orderBy}: ${direction}`)

      try {
        transactions = await Transaction.find({ user: user.id })
          .sort({ [orderBy]: direction })
          .skip(offset)
          .limit(limit)
          .populate('user', 'id firstName lastName username email')
      } catch (error) {
        errorHandler(error)
      }

      return transactions
    },
    transaction: async (_, { id }, { user, models: { Transaction } }) => {
      if (!user) errorHandler('Not authorized', 'You must be logged in')

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
      { input },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById(auth.id)
      } catch (error) {
        errorHandler(error)
      }

      if (!user) {
        return null
      }

      try {
        transaction = await Transaction.create({ ...input, user: auth.id })

        await User.findOneAndUpdate(
          { _id: auth.id },
          { $push: { transactions: transaction._id } },
          { new: true }
        )
      } catch (error) {
        errorHandler(error)
      }

      return transaction
    },
    updateTransaction: async (
      _,
      { id, input },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById(auth.id)
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
      { id },
      { user: auth, models: { Transaction, User } }
    ) => {
      if (!auth) errorHandler('Not authorized', 'You must be logged in')

      let transaction
      let user

      try {
        user = await User.findById(auth.id)
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
