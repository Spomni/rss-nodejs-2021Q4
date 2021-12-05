class PersonError extends Error {}

class InvalidOptionError extends PersonError {
  constructor(name, value) {
    super(`invalid ${name} option = "${value}" was found`)
  }
}

class InvalidIdOptionError extends InvalidOptionError {
  constructor(id) {
    super('id', id)
  }
}

class InvalidNameOptionError extends InvalidOptionError {
  constructor(name) {
    super('name', name)
  }
}

class InvalidAgeOptionError extends InvalidOptionError {
  constructor(age) {
    super('age', age)
  }
}

class InvalidHobbiesOptionError extends InvalidOptionError {
  constructor(hobbies) {
    super('hobbies', hobbies)
  }
}

module.exports = {
  InvalidOptionError,
  InvalidIdOptionError,
  InvalidNameOptionError,
  InvalidHobbiesOptionError,
  InvalidAgeOptionError,
}