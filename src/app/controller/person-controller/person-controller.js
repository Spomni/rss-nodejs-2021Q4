const { handleError } = require('../../error-handler')

const { notImplementedView } = require('../../view/501-not-implemented-view')
const { resourceNotFoundView } = require('../../view/404-resource-not-found-view')

const { getPerson } = require('./get-person')
const { createPerson } = require('./create-person')
const { updatePerson } = require('./update-person')
const { deletePerson } = require('./delete-person')

const methodResolver = {
  get: getPerson,
  post: createPerson,
  put: updatePerson,
  delete: deletePerson,
}

function parsePath(path) {
  return path.replace('/', '').split('/')
}

function resolveRequestMethod(req) {
  const method = req.method.toLowerCase()
  return methodResolver[method]
}

function personController(req, res) {

  const chunks = parsePath(req.path)

  if (chunks.length > 1) {
    resourceNotFoundView(req, res)
    return null
  }

  const handleRequest = resolveRequestMethod(req)

  if (!handleRequest) {
    notImplementedView(req, res)
    return null
  }

  handleRequest(req, res)
    .catch((error) => handleError(req, res, error))
}

module.exports = {
  personController,
}
