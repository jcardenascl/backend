// Dependencies
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import session from 'express-session'
import uuid from 'uuid/v4'
import passport from 'passport'
import FacebookStrategy from 'passport-facebook'

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
import { $port, $cors, $security, $fb } from '@config'

// Middlewares
import notFoundHandler from '@utils/middlewares/notFoundHandler'

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
  context: ({ req }) => ({
    getUser: () => req.user,
    logout: () => req.logout(),
    models: {
      Transaction,
      User
    }
  })
})

const app = express()
const path = '/graphql'
const facebookOptions = {
  clientID: $fb().clientId,
  clientSecret: $fb().clientSecret,
  callbackURL: $fb().callbackUrl,
  profileFields: ['id', 'email', 'first_name', 'last_name']
}
const facebookCallback = (accessToken, refreshToken, profile, done) => {
  const users = User.getUsers()
  const matchingUser = users.find(user => user.facebookId === profile.id)

  if (matchingUser) {
    done(null, matchingUser)
    return
  }

  const newUser = {
    id: uuid(),
    facebookId: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    email: profile.emails && profile.emails[0] && profile.emails[0].value
  }

  users.push(newUser)

  done(null, newUser)
}

// Passport
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  const users = User.getUsers()
  const matchingUser = users.find(user => user.id === id)
  done(null, matchingUser)
})

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
app.use(
  session({
    genid: () => uuid(),
    secret: $security().secretKey,
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new FacebookStrategy(facebookOptions, facebookCallback))

server.applyMiddleware({ app, path })

// Routes
app.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
)
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: 'http://localhost:4000/graphql',
    failureRedirect: 'http://localhost:4000/graphql'
  })
)

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
