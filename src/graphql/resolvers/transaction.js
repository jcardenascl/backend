// Error Handler
import errorHandler from '@lib/errorHandler'

export default {
  Query: {
    transactions: async (_, args, { models: { Transaction } }) => {
      let transactions

      try {
        transactions = await Transaction.find().exec()
      } catch (error) {
        errorHandler(error)
      }

      return transactions
    },
    transaction: async (_, { id }, { models: { Transaction } }) => {
      let transaction

      try {
        transaction = await Transaction.findById({ _id: id }).exec()
      } catch (error) {
        errorHandler(error)
      }

      return transaction
    }
  },
  Mutation: {
    transaction: async (_, { input }, { models: { Transaction } }) => {
      let transaction

      try {
        transaction = await Transaction.create(input)
      } catch (error) {
        errorHandler(error)
      }

      return transaction
    },
    updateTransaction: async (
      _,
      { id, input },
      { models: { Transaction } }
    ) => {
      let transaction

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
    },
    deleteTransaction: async (_, { id }, { models: { Transaction } }) => {
      let transaction

      try {
        transaction = await Transaction.findOneAndDelete({ _id: id })
      } catch (error) {
        errorHandler(error)
      }

      return transaction !== null
        ? `Transaction:${id} deleted successfully`
        : `Transaction:${id} didn't exist`
    }
  }
}
