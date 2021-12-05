const { badRequestView } = require('../../view/400-bad-request-view')
const { personCreatedView } = require('../../view/person-created-view')
const crud = require('../../model/crud')

async function createPerson(req, res) {
  const body = await req.readBody()
  let person = null

  try {
    personLike = JSON.parse(body)
    person = crud.person.create(personLike)
  } catch ({ message }) {
    badRequestView(req, res, { message })
    return
  }

  personCreatedView(req, res, { person })
}

module.exports = {
  createPerson,
}
