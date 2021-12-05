const { StorableInterface } = require('../storable-interface')

const {
  InvalidIdOptionError,
  InvalidNameOptionError,
  InvalidHobbiesOptionError,
  InvalidAgeOptionError,
} = require('./person-errors')

const {
  isPersonId,
  isPersonName,
  isPersonAge,
  isPersonHobbies,
} = require('./person-helpers')

class Person extends StorableInterface {

  constructor({ id, name, age, hobbies }) {
    super()

    this.id = id
    this.name = name
    this.age = age
    this.hobbies = hobbies
  }

  get id() { return this._id }
  set id(value) {
    if (!isPersonId(value)) {
      throw new InvalidIdOptionError(value)
    }
    this._id = value
  }

  get name() { return this._name }
  set name(value) {
    if (!isPersonName(value)) {
      throw new InvalidNameOptionError(value)
    }
    this._name = value
  }

  get age() { return this._age }
  set age(value) {
    if (!isPersonAge(value)) {
      throw new InvalidAgeOptionError(value)
    }
    this._age = value
  }

  get hobbies() { return [...this._hobbies] }
  set hobbies(value) {
    if (!isPersonHobbies(value)) {
      throw new InvalidHobbiesOptionError(value)
    }
    this._hobbies = [...value]
  }

  toPlain() {
    const { id, name, age, hobbies } = this
    return { id, name, age, hobbies }
  }
}

function createPerson(...args) {
  return new Person(...args)
}

function isPerson(value) {
  return value instanceof Person
}

module.exports = {
  Person,
  createPerson,
  isPerson,
}
