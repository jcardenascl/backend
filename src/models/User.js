// Dependencies
import { Schema, model } from 'mongoose'
import { encrypt } from 'fogg-utils'

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
      type: String,
      min: [8, 'Password too short'],
      max: [128, 'Password too long']
    },
    salary: {
      type: Number
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
UserSchema.statics.upsertFbUser = async function facebookAuth({
  accessToken,
  profile
}) {
  const User = this
  const user = await User.findOne({ email: profile.emails[0].value })

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      username: randomUsername(),
      avatar: `https://graph.facebook.com/${profile.id}/picture?redirect=true&height=470&width=470`,
      email: profile.emails[0].value,
      'social.facebookProvider': {
        id: profile.id,
        token: accessToken
      },
      lastLogin: Date.now()
    })

    return newUser
  }

  // if user was found, update the social providers and lastLogin
  const updatedUser = await User.findOneAndUpdate(
    { email: profile.emails[0].value },
    {
      $set: {
        'social.facebookProvider': {
          id: profile.id,
          token: accessToken
        },
        lastLogin: Date.now()
      }
    }
  )

  return updatedUser
}

UserSchema.statics.upsertGoogleUser = async function googleAuth({
  accessToken,
  profile
}) {
  const User = this
  const user = await User.findOne({ email: profile.emails[0].value })

  // no user was found, lets create a new one
  if (!user) {
    const newUser = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      username: randomUsername(),
      avatar: profile._json.picture,
      email: profile.emails[0].value,
      'social.googleProvider': {
        id: profile.id,
        token: accessToken
      },
      lastLogin: Date.now()
    })

    return newUser
  }

  // if user was found, update the social providers and lastLogin
  const updatedUser = await User.findOneAndUpdate(
    { email: profile.emails[0].value },
    {
      $set: {
        'social.googleProvider': {
          id: profile.id,
          token: accessToken
        },
        lastLogin: Date.now()
      }
    }
  )

  return updatedUser
}

const User = model('users', UserSchema)

export default User
