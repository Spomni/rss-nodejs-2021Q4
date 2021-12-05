const { v4, validate } = require('uuid')

function generate() {
  return v4()
}

module.exports = {
  generate,
  validate,
}
