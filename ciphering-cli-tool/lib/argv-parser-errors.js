class ArgvParserError extends Error {}
class InputError extends ArgvParserError {}

class InvalidArgumentError extends ArgvParserError {
  constructor(...args) {
    super('InvalidArgumentError: unexpected value ')
    if (args.length) this.message += args[0]
  }
}

class InvalidNameDeclarationError extends ArgvParserError {
  constructor(...args) {
    super('InvalidNameDeclarationError: option name must match to the pattern /(^-\w$)|(^--\w[\-\w]+$)/.')
    if (args.length) this.message += 'Found incorect name: ' + args[0]
  }
}

class InvalidAliasDeclarationError extends ArgvParserError {
  constructor(...args) {
    super(`InvalidAliasDeclarationError: alias must be an array of the option names.`)
    if (args.length) this.message += 'Found incorect alias: ' + args[0]
  }
}

class DuplicateOptionDeclarationError extends ArgvParserError {
  constructor(name) {
    super(`DuplicateOptionDeclarationError: the option ${name} has already been declared`)
  }
}

class OptionTypeConflictError extends ArgvParserError {
  constructor(name) {
    super(`OptionTypeConflictError: the option "${name}" can not be a flag and an array at the same time`)
  }
}

class FirstArgumentError extends InputError {
  constructor(name) {
    super('FirstArgumentError: application can not be called without options')
  }
}

class InvalidOptionsError extends InputError {
  constructor(name) {
    super(`InvalidOptionsError: invalid option "${name}" was found`)
  }
}

class UnknownOptionNameError extends InputError {
  constructor(name) {
    super(`UnknownOptionsNameError: unknown option "${name}" was found`)
  }
}

class FlagOptionValueError extends InputError {
  constructor(name) {
    super(`FlagOptionValueError: the "${name}" option is a flag and can not have any value`)
  }
}

class UnexpectedValuesArrayError extends InputError {
  constructor(name) {
    super(`UnexpectedValuesArrayError: the option "${name}" must be assigned with one value only`)
  }
}

class MissedRequiredOptionError extends InputError {
  constructor(name) {
    super(`MissedRequiredOptionError: the option "${name}" must not be missed`)
  }
}

class MissedOptionValueError extends InputError {
  constructor(name) {
    super(`MissedOptionValueError: the option "${name}" must has a value`)
  }
}

class DuplicatedOptionError extends InputError {
  constructor(alias) {
    const name = alias.filter((name) => name[1] === '-')[0]
    super(`DuplicatedOptionError: the option "${name}" can not be duplicated`)
  }
}

module.exports = {
  ArgvParserError,
  InputError,

  InvalidArgumentError,
  InvalidNameDeclarationError,
  InvalidAliasDeclarationError,
  DuplicateOptionDeclarationError,
  OptionTypeConflictError,

  FirstArgumentError,
  InvalidOptionsError,
  UnknownOptionNameError,
  FlagOptionValueError,
  UnexpectedValuesArrayError,
  MissedRequiredOptionError,
  MissedOptionValueError,
  DuplicatedOptionError,
}