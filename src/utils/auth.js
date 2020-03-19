// Dependencies
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'

// Utils
import { encrypt, setBase64, isPasswordMatch } from 'fogg-utils'

// Configuration
import { $security } from '@config'

export const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, $security().secretKey)
    }

    return null
  } catch (err) {
    return null
  }
}

export const createToken = async user => {
  const { id, username, password, email } = user
  const token = setBase64(`${encrypt($security().secretKey)}${password}`)
  const userData = {
    id,
    username,
    email,
    token
  }

  const createTk = jwt.sign(
    { data: setBase64(userData) },
    $security().secretKey,
    { expiresIn: $security().expiresIn }
  )

  return Promise.all([createTk])
}

export const doLogin = async (email, password, models) => {
  const user = await models.User.findOne({ email })

  if (!user) {
    throw new AuthenticationError('Invalid login')
  }

  const passwordMatch = isPasswordMatch(encrypt(password), user.password)
  // const isActive = user.active

  if (!passwordMatch) {
    throw new AuthenticationError('Invalid login')
  }

  // if (!isActive) {
  //   throw new AuthenticationError('Your account is not activated yet')
  // }

  const [token] = await createToken(user)

  return {
    token
  }
}
