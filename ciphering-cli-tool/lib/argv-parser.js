
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

const defaultDeclaration = {
  isFlag: false,
  isArray: false,
  isRequired: false,
}

const isObject = (value) => typeof value === 'object' && value !== null
const isArray = (value) => value instanceof Array

function isOptionName(value) {
  return /(^-\w$)|(^--\w[\-\w]+$)/.test(value)
}

function isOptionNamesArray(value) {
  return isArray(value) && value.every((alias) => isOptionName(alias))
}

// TODO: write jsdoc for the function completeOption()
function completeOption(declaration) {
  return Object.assign(
    {},
    defaultDeclaration,
    declaration,
    {
      value: null,
      alias: declaration.alias || [],
    },
  )
}

/**
 * Get all items that is starting from a dash and is not valid option name
 *
 * @param {string[]} array
 *
 * @returns {array}
 */
function getInvalidOptions(array) {
  return [...array].splice(2, array.length)
    .filter((item) => item[0] === '-' && !isOptionName(item))
}

// TODO: rename the "argv" option to the "array" one
/**
 * Read option value from the "argv" array starting from the "start" index to the index of the next option item or end of array
 *
 * Return an array [ value, nextIndex ] where "value" is readed value and the "nextIndex" is the next index after value
 *
 * Return undefined as value if the next item is option or end of the array
 *
 * Return an array as valie if the value contains more then one items
 *
 * @param {string[]} argv
 * @param {number} start
 *
 * @returns {array}
 */
function readOptionValue(argv, start) {
  let value = null
  let index = start
  let item = argv[index]

  while (item && !isOptionName(item)) {

    if (/(^'.*'$)|(^".*"$)/.test(item)) {
      item = item.replace(/(^('|"))|(('|")$)/g, '')
    }

    if (!value) {
      value = item
    } else {
      if (!isArray(value)) value = [value]
      value.push(item)
    }

    index += 1
    item = argv[index]
  }

  return [ value, index ]
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