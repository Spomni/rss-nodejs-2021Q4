const { badRequestView } = require('../../view/400-bad-request-view')
const { resourceNotFoundView } = require('../../view/404-resource-not-found-view')
const { personDeletedView } = require('../../view/person-deleted-view')

const crud = require('../../model/crud')

function parsePath(path) {
  return path.replace('/', '').split('/')
}


async function deletePerson(req, res) {

  const [ personId, nextChunk ] = parsePath(req.path)
  let person = null

  try {
    person = crud.person.getById(personId)

    if (!person) {
      resourceNotFoundView(req, res)
      return null
    }

    crud.person.delete(person)

  } catch ({ message }) {
    badRequestView(req, res, { message })
    return null
  }

  personDeletedView(req, res)
  return true
}

module.exports = {
  deletePerson,
}
