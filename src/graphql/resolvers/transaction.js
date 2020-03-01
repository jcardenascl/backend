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
    }
  }
}
