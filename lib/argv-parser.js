const { argv } = require('process')
const {
  InvalidArgumentError,
  InvalidNameDeclarationError,
  InvalidAliasDeclarationError,
  DuplicateOptionDeclarationError,
  OptionTypeConflictError,
} = require('./argv-parser-errors')

const defaultDeclaration = {
  isFlag: true,
  isArray: false,
  isRequired: false,
  alias: [],
}

const isObject = (value) => typeof value === 'object' && value !== null
const isArray = (value) => value instanceof Array

function isOptionName(value) {
  return /(^-\w$)|(^--\w[\-\w]+$)/.test(value)
}

function isOptionNamesArray(value) {
  return isArray(value) && value.every((alias) => isOptionName(alias))
}

function completeOption(declaration) {
  return Object.assign(
    {},
    defaultDeclaration,
    declaration,
    { value: null },
  )
}

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
      option.alias.push(name)
      option.alias.forEach((alias) => this._options[alias] = option)
    })
  }

  /**
   * Process process.argv array to get an object implementation of the cli options
   *
   * @returns {CliOptions}
   */
  exec() {
    const firstArgument = argv[2]

    if (!isOptionName(firstArgument)) {
      throw new ExpectOptionError(firstArgument)
    }

    let index = 2
    let currentArgument = argv[index]

    while (currentArgument) {

      const name = currentArgument
      const [ value, nextIndex ] = readOptionValue(argv, index + 1)
      const option = this._options[name]

      if (!isOptionName(name)) {
        throw new InvalidOptionNameError(name)
      }

      if (!option) {
        throw new UnlnownOptionNameError(name)
      }

      if (!option.isArray && isArray(value)) {
        throw new UnexpectedValuesArrayError(name, value)
      }

      if (option.isFlag) {
        if (value) throw new FlagOptionValueError(name)
        option[name] = true
      } else {
        if (!value) throw new MissedOptionValueError(name)
        option[name] =  value
      }

      index = nextIndex
      currentArgument = argv[index]
    }

    const missed = this.getMissedOptions({ requiredOnly: true })
    if (missed.length) {
      throw new MissedRequiredOptionsError(missed)
    }
  }

  /**
   * @return {CliOptions}
   */
  getOptions() {
    return {
      config: null,
      input: null,
      output: null,
    }
  }
}

module.exports = {
  ArgvParser,
  parser: new ArgvParser(),
}