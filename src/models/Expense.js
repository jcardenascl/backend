// Dependencies
import { Schema, model } from 'mongoose'

const ExpenseSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  ammount: {
    type: Number,
    required: [true, 'Please add an ammount']
  },
  type: {
    type: String,
    enum: ['more', 'minus'],
    required: () => {
      this.ammount > 0
    }
  },
  currency: {
    type: String,
    enum: ['VEF', 'USD'],
    required: [true, 'Please choose a correct currency: VEF or USD']
  }
})

const Expense = model('expenses', ExpenseSchema)

export default Expense
