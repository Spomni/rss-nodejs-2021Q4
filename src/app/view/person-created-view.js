const { personView } = require('./person-view')

function personCreatedView(req, res, { person }) {
  personView(req, res, { person, statusCode: 201 })
}

module.exports = {
  personCreatedView,
}