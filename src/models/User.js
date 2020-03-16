// Dependencies
import { Schema, model } from 'mongoose'
import { encrypt } from 'fogg-utils'
import jwt from 'jsonwebtoken'

// Configuration
import { $security } from '@config'

// Utils
import randomUsername from '@utils/randomUsername'

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
      // required: [true, 'Please add a username'],
      unique: [true, 'Username must be unique']
    },
    email: {
      type: String,
      required: [true, 'Please add a email'],
      unique: [true, 'Email must be unique']
    },
    avatar: {
      type: String
    },
    avatarThumb: {
      type: String
    },
    password: {
      type: String
      // required: [true, 'Please add a password']
    },
    lastLogin: {
      type: Date
    },
    social: {
      facebookProvider: {
        id: String,
        token: String
      },
      googleProvider: {
        id: String,
        token: String
      }
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

// Model hooks
UserSchema.pre('save', function preSave(next) {
  if (this.password && this.isModified('password')) {
    this.password = encrypt(this.password)
  }

  next()
})

// Models methods
UserSchema.methods.generateJWT = function generateJwt() {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + 60)

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    },
    $security().secretKey
  )
}

UserSchema.statics.upsertFbUser = async function facebookAuth({
  accessToken,
  refreshToken,
  profile
}) {
  const User = this
  const user = await User.findOne({ 'social.facebookProvider.id': profile.id })

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      username: randomUsername(),
      avatar: `https://graph.facebook.com/${profile.id}/picture?redirect=true&height=470&width=470`,
      avatarThumb: profile.photos[0].value,
      email: profile.emails[0].value,
      'social.facebookProvider': {
        id: profile.id,
        token: accessToken
      },
      lastLogin: Date.now()
    })

    return newUser
  }

  return user
}

UserSchema.statics.upsertGoogleUser = async function googleAuth({
  accessToken,
  refreshToken,
  profile
}) {
  const User = this
  const user = await User.findOne({ 'social.googleProvider.id': profile.id })

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      name: profile.displayName || `${profile.familyName} ${profile.givenName}`,
      email: profile.emails[0].value,
      'social.googleProvider': {
        id: profile.id,
        token: accessToken
      }
    })

    return newUser
  }

  return user
}

const User = model('users', UserSchema)

export default User
