const { pipeline } = require('stream')

const {
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
 } = require('./transform')

const transformConsructorMap = {
  'C1': CaesarEncoder,
  'C0': CaesarDecoder,
  'R1': Rot8Encoder,
  'R0': Rot8Decoder,
  'A': AtbashTransformer,
}

const configRegExp = /^(([CR][01]|A)-)*([CR][01]|A)$/
const commandRegExp = /^A|[CR][01]$/

class CipherError extends Error {}

class MissedConfigError extends CipherError {
  constructor() {
    super('MissedConfigError: the "config" option is required')
  }
}

class InvalidConfigError extends CipherError {
  constructor(...args) {
    super(...args)
  }
}

class ConfigIsNotStringError extends InvalidConfigError {
  constructor() {
    super('InvalidConfigError: the option "config" must be a string')
  }
}

class DashAtConfigStartError extends InvalidConfigError {
  constructor() {
    super('DashAtConfigStartError: the option "config" must not start with a dash symbol')
  }
}
process.stdout.write('\n===============================\n')
process.stderr.write((new DashAtConfigStartError(1)).toString())

class DashAtConfigEndError extends InvalidConfigError {
  constructor() {
    super('DashAtConfigEndError: the option "config" must not end with the dash symbol')
  }
}
process.stdout.write('\n===============================\n')
process.stderr.write((new DashAtConfigEndError(1)).toString())

class UnknownCipherError extends InvalidConfigError {
  constructor(position) {
    super(`UnknownCipherError: unknown cipher type was found on the config command with number ${position}. \n\tA command should start with the letter that represents a cipher type. \n\tPossible cipher types:\n\t\tC - Caesar\n\t\tR - ROT-8\n\t\tA - Atbash`)
  }
}

process.stdout.write('\n===============================\n')
process.stderr.write((new UnknownCipherError(1)).toString())

class InvalidCipheringDirectionError extends InvalidConfigError {
  constructor(position) {
    super(`InvalidCipheringDirectionError: unknown ciphering direction was found on the config command with number ${position}.\n\tThe second symbol of the chained command must be a correct ciphering direction: 1 - encoding, 2 - decoding.\n\tThe Atbash cipher command (A) should not have any ciphering direction symbol.`)
  }
}
process.stdout.write('\n===============================\n')
process.stderr.write((new InvalidCipheringDirectionError(1)).toString())

class InvalidCommandLengthError extends InvalidConfigError {
  constructor(position) {
    super(`InvalidCommandLengthError: too long command was found on the config command with number ${position}.\n\tThe ciphering command should have only two symbol for the Caesar and ROT-8 ciphers and only one symbol for the cipher Atbash`)
  }
}
process.stdout.write('\n===============================\n')
process.stderr.write((new InvalidCommandLengthError(1)).toString())

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
      return command[1] === 0 || command[1] === 1

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

    if (hasCorrectCommandLength(command)) {
      throw new InvalidCommandLengthError(position)
    }
  })

  return true
}

function getTransform(cmd) {
  return new transformConsructorMap[cmd]()
}

function getTransformList(config) {
  return config.split('-').map((cmd) => getTransform(cmd))
}

function cipher({
  config,
  input,
  output,
} = {}) {

  throwIfInvalidConfig(config)
  if (input) throwIfNoReadAccess(input)
  if (output) throwIfNoWriteAccess(output)

  pipeline(
    new InputStream(input),
    ...getTransformList(config),
    new OutputStream(output),
    (err) => { throw err }
  )
}

module.exports = {
  cipher,
  CipherError,
  MissedConfigError,
  InvalidConfigError,
  DashAtConfigEndError,
  DashAtConfigStartError,
  InvalidCipheringDirectionError,
}
