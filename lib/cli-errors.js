class ValidationError extends Error {
  constructor(...args) {
    super(...args)
  }
}

class MissedConfigError extends ValidationError {
  constructor() {
    super('MissedConfigError: the "config" option is required')
  }
}

class ConfigIsNotStringError extends ValidationError {
  constructor() {
    super('InvalidConfigError: the option "config" must be a string')
  }
}

class DashAtConfigStartError extends ValidationError {
  constructor() {
    super('DashAtConfigStartError: value of the option "--config" must not start with a dash symbol')

  }
}

class DashAtConfigEndError extends ValidationError {
  constructor() {
    super('DashAtConfigEndError: value of the option "--config" must not be ended with a dash symbol')
  }
}

class UnknownCipherError extends ValidationError {
  constructor(command, position) {
    super(`UnknownCipherError: unknown cipher type was found on the config command "${command}" with number ${position}. \n\tA command should start with the letter that represents a cipher type. \n\tPossible cipher types:\n\t\tC - Caesar\n\t\tR - ROT-8\n\t\tA - Atbash`)
  }
}

class InvalidCipheringDirectionError extends ValidationError {
  constructor(command, position) {
    super(`InvalidCipheringDirectionError: unknown ciphering direction was found on the config command "${command}" with number ${position}.\n\tThe second symbol of the chained command must be a correct ciphering direction: 1 - encoding, 0 - decoding.\n\tThe Atbash cipher command (A) should not have any ciphering direction symbol`)
  }
}

class InvalidCommandLengthError extends ValidationError {
  constructor(command, position) {
    super(`InvalidCommandLengthError: too long command "${command}" was found on the config command with number ${position}.\n\tThe ciphering command should have only two symbol for the Caesar and ROT-8 ciphers and only one symbol for the cipher Atbash`)
  }
}

class NoAccessToReadError extends ValidationError {
  constructor(filePath) {
    super(`NoAccessToReadError: file "${filePath}" can not be readed: check if it exists and you have access to read`)
  }
}

class InputIsDirectoryError extends ValidationError {
  constructor(filePath) {
    super(`InputIsDirectoryError: passed input file "${filePath}" is a directory`)
  }
}

class NoAccessToWriteError extends ValidationError {
  constructor(filePath) {
    super(`NoAccessToWriteError: file "${filePath}" can not be written: check if it exists and you have access to write`)
  }
}

class OutputIsDirectoryError extends ValidationError {
  constructor(filePath) {
    super(`OutputIsDirectoryError: passed output file "${filePath}" is a directory`)
  }
}

module.exports = {
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
}