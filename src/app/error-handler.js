const {isUnresolvedRequestError } = require('../contract/unresolved-request-error')
const { resourceNotFoundView } = require('./view/404-resource-not-found-view')
const { internalServerErrorView } = require('./view/500-internal-server-error-view')

function handleError(req, res, error) {

  if (isUnresolvedRequestError(error)) {
    resourceNotFoundView(req, res)
    return
  }

  internalServerErrorView(req, res)

  if (process.env.NODE_ENV === 'development') {
    console.error(error)
  }
}

module.exports = {
  handleError,
}
