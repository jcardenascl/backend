// Dependencies
import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'

// Utils
import { encrypt, setBase64, getBase64, isPasswordMatch } from 'fogg-utils'

// Configuration
import { $security } from '@config'

export const getUser = async token => {
  let data

  try {
    if (token) {
      const decodeToken = jwt.verify(token, $security().secretKey)

      data = getBase64(decodeToken.data)
    }
  } catch (err) {
    return null
  }

  return data
}

export const createToken = async user => {
  const { id, password } = user
  const token = setBase64(`${encrypt($security().secretKey)}${password}`)
  const userData = {
    id,
    token
  }

  const createTk = jwt.sign(
    { data: setBase64(userData) },
    $security().secretKey,
    {
      expiresIn: $security().expiresIn
    }
  )

  return Promise.all([createTk])
}

export const doLogin = async (email, password, models) => {
  const user = await models.User.findOne({ email })

  if (!user) {
    throw new AuthenticationError('Invalid login')
  }

  const passwordMatch = isPasswordMatch(encrypt(password), user.password)

  if (!passwordMatch) {
    throw new AuthenticationError('Invalid login')
  }

  const [token] = await createToken(user)

  return {
    token
  }
}
