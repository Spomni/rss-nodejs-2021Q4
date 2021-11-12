class CipherError extends Error {}

class InvalidConfigError extends CipherError {
  constructor(...args) {
    super(...args)
  }
}

class MissedConfigError extends InvalidConfigError {
  constructor() {
    super('MissedConfigError: the "config" option is required')
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

class DashAtConfigEndError extends InvalidConfigError {
  constructor() {
    super('DashAtConfigEndError: the option "config" must not end with the dash symbol')
  }
}

class UnknownCipherError extends InvalidConfigError {
  constructor(position) {
    super(`UnknownCipherError: unknown cipher type was found on the config command with number ${position}. \n\tA command should start with the letter that represents a cipher type. \n\tPossible cipher types:\n\t\tC - Caesar\n\t\tR - ROT-8\n\t\tA - Atbash`)
  }
}

class InvalidCipheringDirectionError extends InvalidConfigError {
  constructor(position) {
    super(`InvalidCipheringDirectionError: unknown ciphering direction was found on the config command with number ${position}.\n\tThe second symbol of the chained command must be a correct ciphering direction: 1 - encoding, 2 - decoding.\n\tThe Atbash cipher command (A) should not have any ciphering direction symbol.`)
  }
}

class InvalidCommandLengthError extends InvalidConfigError {
  constructor(position) {
    super(`InvalidCommandLengthError: too long command was found on the config command with number ${position}.\n\tThe ciphering command should have only two symbol for the Caesar and ROT-8 ciphers and only one symbol for the cipher Atbash`)
  }
}

class NoAccessToReadError extends CipherError {
  constructor(error) {
    super(error.message)
  }
}

class InputIsDirectoryError extends CipherError {
  constructor(filePath) {
    super(`InputIsDirectoryError: passed input file ${filePath} is a directory`)
  }
}

class NoAccessToWriteError extends CipherError {
  constructor(error) {
    super(error.message)
  }
}

class OutputIsDirectoryError extends CipherError {
  constructor(filePath) {
    super(`outputIsDirectoryError: passed output file ${filePath} is a directory`)
  }
}

module.exports = {
  CipherError,

  InvalidConfigError,
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