const {
  CipherError,
  MissedConfigError,
  InvalidConfigError,
  ConfigIsNotStringError,
  DashAtConfigStartError,
  DashAtConfigEndError,
  UnknownCipherError,
  InvalidCipheringDirectionError,
  InvalidCommandLengthError,
} = require('./cipher-errors')

const configRegExp = /^(([CR][01]|A)-)*([CR][01]|A)$/

function isDashAtStart(string) {
  return string[0] === '-'
}

function isDashAtEnd(string) {
  return string[string.length - 1] === '-'
}

function hasKnownCipher(command) {
  return ['A', 'C', 'R'].includes(command[0])
}

function hasValidCipheringDirection(command) {
  switch (command[0]) {

    case 'A':
      return command.length === 1

    case 'R':
    case 'C':
      return command[1] === '0' || command[1] === '1'

    default:
      return false
  }
}

function hasCorrectCommandLength(command) {
  switch (command[0]) {

    case 'A':
      return command.length === 1

    case 'C':
    case 'R':
      return command.length === 2

    default:
        return false
  }
}

function throwIfInvalidConfig(config) {

  if (!config) throw new MissedConfigError()

  if (typeof config !== 'string') throw new ConfigIsNotStringError()

  if (configRegExp.test(config)) return

  if (isDashAtStart(config)) throw new DashAtConfigStartError()
  if (isDashAtEnd(config)) throw new DashAtConfigEndError()

  config.split('-').forEach((command, index) => {
    const position = index + 1

    if (!hasKnownCipher(command)) {
      throw new UnknownCipherError(position)
    }

    if (!hasValidCipheringDirection(command)) {
      throw new InvalidCipheringDirectionError(position)
    }

    if (!hasCorrectCommandLength(command)) {
      throw new InvalidCommandLengthError(position)
    }
  })

  return true
}

module.exports = {
  throwIfInvalidConfig,
}