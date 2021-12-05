const { validate: isPersonId } = require('../../lib/uuid')

function isString(value) {
  return typeof value === 'string'
}

function isArrayOfStrings(value) {
  if (!Array.isArray(value)) return false

  if (value.length > 0) {
    return value.every((item) => isString(item))
  }

  return true
}

function isPersonName(value) {
  return isString(value)
}

function isPersonAge(value) {
  return typeof value === 'number'
}

function isPersonHobbies(value) {
  return isArrayOfStrings(value)
}

module.exports = {
  isPersonId,
  isPersonName,
  isPersonAge,
  isPersonHobbies,
}
