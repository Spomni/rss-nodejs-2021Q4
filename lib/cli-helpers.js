const fs = require('fs')

const { ArgvParserError } = require('./argv-parser')
const { CipherError } = require('./cipher')

const {
  ValidationError,
  
  MissedConfigError,
  ConfigIsNotStringError,
  DashAtConfigStartError,
  DashAtConfigEndError,
  UnknownCipherError,
  InvalidCipheringDirectionError,
  InvalidCommandLengthError,
  
  NoAccessToReadError,
  InputIsDirectoryError,
  
  NoAccessToWriteError,
  OutputIsDirectoryError,
} = require('./cli-errors')

function isInDebugMode() {
  return process.argv.includes('--debug')
}

function isKnownError(value) {
  return value instanceof Error && (
    value instanceof ArgvParserError ||
    value instanceof CipherError
  )
}

function extractCipherOptions(cliOptions) {
  return {
    config: cliOptions['--config'],
    input: cliOptions['--input'],
    output: cliOptions['--output'],
  }
}

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

function validateConfigOption(config) {

  if (!config) throw new MissedConfigError()

  if (typeof config !== 'string') throw new ConfigIsNotStringError()

  if (configRegExp.test(config)) return true

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

function isDirectory(filePath) {
  return fs.lstatSync(filePath).isDirectory()
}

function validateInputOption(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
  } catch (err) {
    throw new NoAccessToReadError(err)
  }

  if (isDirectory(filePath)) {
    throw new InputIsDirectoryError(filePath)
  }
}

function validateOutputOption(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.W_OK)
  } catch (err) {
    throw new NoAccessToWriteError(err)
  }

  if (isDirectory(filePath)) {
    throw new OutputIsDirectoryError(filePath)
  }
}

function validateCipherOptions({
  config,
  input,
  output
}) {
  validateConfigOption(config)
  if (input) validateInputOption(input)
  if (output) validateOutputOption(output)
}

module.exports = {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
  validateCipherOptions,
}