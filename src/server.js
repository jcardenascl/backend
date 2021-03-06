// Dependencies
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'

// Models
import Transaction from '@models/Transaction'
import User from '@models/User'

// Type Definitions
import typeDefs from '@types'

// Resolvers
import resolvers from '@resolvers'

// Database Connection
import db from '@lib/database'

// Configuration
import { $port, $cors } from '@config'

// Middlewares
import notFoundHandler from '@utils/middlewares/notFoundHandler'

// Utils
import { getUser } from '@utils/auth'

// Schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Apollo Server
const server = new ApolloServer({
  cors: {
    origin: '*',
    credentials: true
  },
  schema,
  context: async ({ req, res }) => {
    // Get the user token from the headers.
    const tokenWithBearer = req.headers.authorization || ''
    const token = tokenWithBearer.split(' ')[1]

    // try to retrieve a user with the token
    const user = await getUser(token).then(result => result)

    // add the user to the context
    return {
      req,
      res,
      user,
      models: {
        Transaction,
        User
      }
    }
  }
})

const app = express()
const path = '/graphql'

// Init middlewares
if (app.get('env') === 'production') {
  app.use(
    morgan('common', {
      skip(req, res) {
        return res.statusCode < 400
      },
      stream: `${__dirname}/../morgan.log`
    })
  )
} else {
  app.use(morgan('dev'))
}
app.use(cors($cors()))
app.use(express.json())

server.applyMiddleware({ app, path })

// Catch 404
app.use(notFoundHandler)

db()
  .then(() => {
    console.log('MongoDB Connected')

    app.listen({ port: $port() }, () => {
      console.log(
        `🚀  Server ready at http://localhost:${$port()}${server.graphqlPath}`
      )
    })
  })
  .catch(err => console.error(err))
