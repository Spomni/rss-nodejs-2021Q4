const {
  defaultDeclaration,
  isObject,
  isArray,
  isOptionName,
  isOptionNamesArray,
  completeOption,
  getInvalidOptions,
  readOptionValue,
} = require('./argv-parser-helpers')

const {
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
} = require('./argv-parser-errors')

/**
 * @typedef {string} OptionName - match /^--[\w\d\-_]{2,}$/
 */

/**
 * @typedef {string} ShortOptionName - match /^-[\w\d]{1}$/
 */

/*
 * @typedef {object} OptionDeclaration
 *
 * @property {OptionName|ShortOptionName} name
 * @property {boolean} [isFlag]
 * @property {boolean} [isRequired]
 */

/**
 * @typedef {object} ArgvParserConfig
 *
 * @property {OptionDeclaration|OptionDeclaration[]} declare
 */

class ArgvParser {

  constructor() {
    this._options = {}
    this._isExecuted = false
  }

  /**
   * Config ArgvParser instance
   *
   * @param {ArgvParserConfig} config
   *
   * @returns {ArgvParser}
   */
  config(config) {
    if (!config) throw new InvalidArgumentError(config)

    const { declare } = config
    if (declare) this.declare(declare)

    return this
  }

  /**
   * Register cli options
   *
   * @param {OptionDeclaration|OptionDeclaration[]} options
   */
  declare(declarationList) {

    if (!isObject(declarationList) && !isArray(declarationList)) {
      throw new InvalidArgumentError(declarationList)
    }

    const list = isArray(declarationList)
      ? declarationList
      : [declarationList]

    list.forEach((declaration) => {

      const { name } = declaration

      if (!isOptionName(name)) {
        throw new InvalidNameDeclarationError(declaration.name)
      }

      if (this._options[name]) {
        throw new DuplicateOptionDeclarationError(name)
      }

      if (declaration.isFlag && declaration.isArray) {
        throw new OptionTypeConflictError(name)
      }

      if (declaration.alias && !isOptionNamesArray(declaration.alias)) {
        throw new InvalidAliasDeclarationError(declaration.alias)
      }

      const option = completeOption(declaration)

      option.alias.unshift(name)
      option.alias.forEach((alias) => this._options[alias] = option)
    })
  }

  /**
   * Process process.argv array to get an object implementation of the cli options
   *
   * @returns {CliOptions}
   */
  exec() {

    const { argv } = process

    const invalidOptions = getInvalidOptions(argv)
    if (invalidOptions.length) {
      throw new InvalidOptionsError(...invalidOptions)
    }

    const firstArgument = argv[2]
    if (!isOptionName(firstArgument)) {
      throw new FirstArgumentError(firstArgument)
    }

    let index = 2
    let currentArgument = argv[index]

    while (currentArgument) {

      const name = currentArgument
      const [ value, nextIndex ] = readOptionValue(argv, index + 1)
      const option = this._options[name]

      if (!option) {
        throw new UnknownOptionNameError(name)
      }

      if (!option.isArray && isArray(value)) {
        throw new UnexpectedValuesArrayError(name, value)
      }

      if (option.value) {
        throw new DuplicatedOptionError(option.alias)
      }

      if (option.isFlag) {
        if (value) throw new FlagOptionValueError(name)
        option.value = true
      } else {
        if (!value) throw new MissedOptionValueError(name)
        option.value = value
      }

      index = nextIndex
      currentArgument = argv[index]
    }

    const missed = this.getMissedOptionsNames({ requiredOnly: true })
    if (missed.length) {
      throw new MissedRequiredOptionError(...missed)
    }

    this._isExecuted = true

    return this.getAll()
  }

  /**
   * @return {CliOptions}
   */
  getAll() {
    if (!this._isExecuted) return null

    let result = {}

    Object.entries(this._options)
      .forEach(([name, option]) => {
        if (option.isFlag) {
          result[name] = !!option.value
        } else if (option.isArray) {
          result[name] = option.value || []
        } else {
          result[name] = option.value
        }
      })

    return result
  }

  getMissedOptionsNames({
    requiredOnly = false
  } = {}) {
    return Object.keys(this._options)
      .filter((name) => !this._options[name].value)
      .filter((name) => !requiredOnly || this._options[name].isRequired)
  }
}

module.exports = {
  ArgvParser,
  parser: new ArgvParser(),
  ArgvParserError,
  InputError,
}