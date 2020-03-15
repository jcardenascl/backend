// Configuration
import { db, serverPort, cors, security, fb } from './config'

// Configurations
export const $db = () => db
export const $port = () => serverPort
export const $cors = () => cors
export const $security = () => security
export const $fb = () => fb
