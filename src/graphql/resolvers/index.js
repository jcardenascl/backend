// Dependencies
import { join } from 'path'
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas'

const resolversArray = fileLoader(join(__dirname, '.'))

export default mergeResolvers(resolversArray, { all: true })
