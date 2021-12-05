const { setErrorHandler, createRouter } = require('../lib/router')
const { handleError } = require('./error-handler')
const { personController } = require('./controller/person-controller')

function createApp() {

  setErrorHandler(handleError)

  const app = createRouter()
  
  app.register({
    path: '/person',
    use: personController,
  })

  return app;
}

module.exports = {
  createApp,
}