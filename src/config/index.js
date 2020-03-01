// Configuration
import { db, serverPort, cors } from './config'

// Configurations
export const $db = () => db
export const $port = () => serverPort
export const $cors = () => cors
