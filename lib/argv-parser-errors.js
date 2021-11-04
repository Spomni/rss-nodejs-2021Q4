class ArgvParserError extends Error {}

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

module.exports = {
  InvalidArgumentError,
  InvalidNameDeclarationError,
  InvalidAliasDeclarationError,
  DuplicateOptionDeclarationError,
  OptionTypeConflictError,
}
