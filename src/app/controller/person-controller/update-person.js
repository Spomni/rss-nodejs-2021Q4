const { badRequestView } = require('../../view/400-bad-request-view')
const { resourceNotFoundView } = require('../../view/404-resource-not-found-view')
const { personUpdatedView } = require('../../view/person-updated-view')

const crud = require('../../model/crud')

function parsePath(path) {
  return path.replace('/', '').split('/')
}

async function updatePerson(req, res) {

  const [ personId, nextChunk ] = parsePath(req.path)

  const body = await req.readBody()
  let person = null

  try {
    person = crud.person.getById(personId)
    personLike = JSON.parse(body)

    if (!person) {
      resourceNotFoundView(req, res)
      return null
    }

    Object.assign(person, personLike)

    person = crud.person.update(person)

  } catch ({ message }) {
    badRequestView(req, res, { message })
    return null
  }

  personUpdatedView(req, res, { person })
  return person
}

module.exports = {
  updatePerson,
}
