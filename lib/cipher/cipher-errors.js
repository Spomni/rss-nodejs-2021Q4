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

module.exports = {
  CipherError,
  MissedConfigError,
  InvalidConfigError,
  ConfigIsNotStringError,
  DashAtConfigStartError,
  DashAtConfigEndError,
  UnknownCipherError,
  InvalidCipheringDirectionError,
  InvalidCommandLengthError,
}