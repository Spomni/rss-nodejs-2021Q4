const  { storage } = require('../storage')
const { createPerson } = require('../person')
const uuid = require('../../lib/uuid')
const { validate: isPersonId } = uuid

class InvalidPersonIdError extends Error {
  constructor(id) {
    super(`invalid id "${id}" was found`)
  }
}

function getAll() {
  return storage.map((personLike) => createPerson(personLike).toPlain())
}

function getById(id) {

  if (!isPersonId(id)) {
    throw new InvalidPersonIdError(id)
  }

  const personLike = storage.find((personLike) => personLike.id === id)

  if (!personLike) return null

  return createPerson(personLike).toPlain()
}

function create(personLike) {
  const id = uuid.generate()
  const person = createPerson(Object.assign({}, personLike, { id }))
  storage.push(person.toPlain())
  return createPerson(getById(person.id)).toPlain()
}

function update(personLike) {

  const storedPersonLike = getById(personLike.id)

  if (!storedPersonLike) return null

  const updatedPersonLike = Object.assign({}, storedPersonLike, personLike)

  const person = createPerson(updatedPersonLike)

  const personInStorage = storage.find((item) => item.id === person.id)

  Object.assign(personInStorage, person.toPlain())

  return createPerson(getById(person.id)).toPlain()
}

function remove({ id }) {
  const person = getById(id)

  if (!person) return null

  const index = storage.find((item) => item.id === person.id)
  storage.splice(index, 1)

  return true
}

module.exports = {
 getAll,
 getById,
 create,
 update,
 delete: remove,
}
