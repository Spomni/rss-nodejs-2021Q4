class UnresolvedRequestError extends Error {
  constructor(request) {
    super()

    const url = (request)
      ? request.url
      : null

    const requestTo = (url)
      ? ` to "${url}"`
      : ''

    this.message = `request${requestTo} is unresolved`
  }
}

function isUnresolvedRequestError(value) {
  return value instanceof UnresolvedRequestError
}

module.exports = {
  UnresolvedRequestError,
  isUnresolvedRequestError,
}
