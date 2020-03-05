// Dependencies
import { Schema, model } from 'mongoose'

const TransactionSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    ammount: {
      type: Number,
      required: [true, 'Please add an ammount']
    },
    currency: {
      type: String,
      enum: ['VEF', 'USD'],
      required: [true, 'Please choose a correct currency: VEF or USD']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  { timestamps: true }
)

const Transaction = model('transactions', TransactionSchema)

export default Transaction
