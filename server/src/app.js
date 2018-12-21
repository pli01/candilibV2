import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import { loggerStream } from './logger'
import routes from './routes'

const app = express()

app.use(morgan('combined', { stream: loggerStream }))

app.use(compression())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

const apiPrefix = '/api'

app.use(apiPrefix, routes)

module.exports = app
