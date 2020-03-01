// Dependencies
import { ApolloServer, makeExecutableSchema } from 'apollo-server'

// Models
import Transaction from '@models/Transaction'

// Type Definitions
import typeDefs from '@types'

// Resolvers
import resolvers from '@resolvers'

// Database Connection
import db from '@lib/database'

// Configuration
import { $port } from '@config'

// Schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Apollo Server
const apolloServer = new ApolloServer({
  cors: {
    origin: '*',
    credentials: true
  },
  schema,
  context: {
    models: {
      Transaction
    }
  }
})

db()
  .then(() => {
    console.log('MongoDB Connected')

    apolloServer.listen($port()).then(({ url, subscriptionsPath }) => {
      console.log(
        `🚀  Server ready at ${url}${subscriptionsPath.replace('/', '')}`
      )
    })
  })
  .catch(err => console.error(err))
