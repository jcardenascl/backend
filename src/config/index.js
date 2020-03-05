// Configuration
import { db, serverPort, cors, security } from './config'

// Configurations
export const $db = () => db
export const $port = () => serverPort
export const $cors = () => cors
export const $security = () => security
