const { personView } = require('./person-view')

function personUpdatedView(req, res, { person }) {
  personView(req, res, { person })
}

module.exports = {
  personUpdatedView,
}
