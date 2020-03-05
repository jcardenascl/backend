// Dependencies
import { Schema, model } from 'mongoose'
import { encrypt } from 'fogg-utils'

const UserSchema = new Schema(
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: [true, 'Username must be unique']
    },
    email: {
      type: String,
      required: [true, 'Please add a email'],
      unique: [true, 'Email must be unique']
    },
    password: {
      type: String,
      required: [true, 'Please add a password']
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'transactions'
      }
    ]
  },
  { timestamps: true }
)

UserSchema.pre('save', function preSave(next) {
  if (this.password && this.isModified('password')) {
    this.password = encrypt(this.password)
  }

  next()
})

const User = model('users', UserSchema)

export default User
