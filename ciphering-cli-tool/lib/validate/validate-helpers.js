const fs = require('fs')
const path = require('path')

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
} = require('./validate-errors')

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

function removeQuotes(string) {
  return string.replace(/'|"/g, '')
}

function validateConfig(config) {

  if (!config) throw new MissedConfigError()

  if (typeof config !== 'string') throw new ConfigIsNotStringError()

  const configToCheck = removeQuotes(config)

  if (configRegExp.test(configToCheck)) return true

  if (isDashAtStart(configToCheck)) throw new DashAtConfigStartError()
  if (isDashAtEnd(configToCheck)) throw new DashAtConfigEndError()

  configToCheck.split('-').forEach((command, index) => {
    const position = index + 1

    if (!hasKnownCipher(command)) {
      throw new UnknownCipherError(command, position)
    }

    if (!hasValidCipheringDirection(command)) {
      throw new InvalidCipheringDirectionError(command, position)
    }

    if (!hasCorrectCommandLength(command)) {
      throw new InvalidCommandLengthError(command, position)
    }
  })

  return true
}

function isDirectory(filePath) {
  return fs.lstatSync(filePath).isDirectory()
}

function validateInput(filePath) {

  if (!filePath) throw new Error('Argument "filePath" is not passed')

  const absPath = path.resolve(filePath)

  try {
    fs.accessSync(absPath, fs.constants.R_OK)
  } catch {
    throw new NoAccessToReadError(absPath)
  }

  if (isDirectory(absPath)) {
    throw new InputIsDirectoryError(absPath)
  }
}

function validateOutput(filePath) {

  if (!filePath) return

  const absPath = path.resolve(filePath)

  try {
    fs.accessSync(filePath, fs.constants.W_OK)
  } catch {
    throw new NoAccessToWriteError(absPath)
  }

  if (isDirectory(absPath)) {
    throw new OutputIsDirectoryError(absPath)
  }
}

module.exports = {
  validateConfig,
  validateInput,
  validateOutput,
}