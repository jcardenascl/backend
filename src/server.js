// Dependencies
import { ApolloServer, makeExecutableSchema } from 'apollo-server'

// Models
import Expense from '@models/Expense'

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
      Expense
    }
  }
})

db()
  .then(() => {
    console.log('MongoDB Connected')

    app.listen({ port: $port() }, () => {
      console.log(
        `🚀 Server ready at http://localhost:${$port()}${
          apolloServer.graphqlPath
        }`
      )
    })
  })
  .catch(err => console.error(err))
