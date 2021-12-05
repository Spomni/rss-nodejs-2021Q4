const { resourceNotFoundView } = require('../../view/404-resource-not-found-view')
const { personView } = require('../../view/person-view')
const { invalidPersonIdView } = require('../../view/invalid-person-id-view')

const { validate: isPersonId } = require('../../lib/uuid')
const crud = require('../../model/crud')

function parsePath(path) {
  return path.replace('/', '').split('/')
}

async function getPerson(req, res) {

  const [ personId, nextChunk ] = parsePath(req.path)

  if (nextChunk) {
    resourceNotFoundView(req, res)
    return null
  }

  if (personId === '') {
    const personList = crud.person.getAll()
    personView(req, res, { personList })
    return personList
  }

  if (!isPersonId(personId)) {
    invalidPersonIdView(req, res, { personId })
    return null
  }

  const person = crud.person.getById(personId)

  if (!person) {
    resourceNotFoundView(req, res)
    return null
  }

  personView(req, res, { person })
  return person
}

module.exports = {
  getPerson,
}
