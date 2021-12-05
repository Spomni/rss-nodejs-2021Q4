const { createServer } = require('http')
const dotenv = require('dotenv')
const { createApp } = require('../app')

dotenv.config()

function startServer() {

  const port = process.env.PORT || 3000
  const host = process.env.HOST || 'localhost'

  const app = createApp()
  const server = createServer(app)

  server.listen(port, host, () => {
    console.log(`Server is started and is listening on port ${port} of ${host}`)
    console.log(`Server is started in the "${process.env.NODE_ENV}" mode`);
  })

  return server
}

module.exports = {
  startServer,
}