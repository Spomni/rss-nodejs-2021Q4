const { badRequestView } = require('./400-bad-request-view')

function invalidPersonIdView(req, res, { personId }) {
  badRequestView(req, res, { message: `invalid person id "${personId}" was found` })
}

module.exports = {
  invalidPersonIdView,
}
