const {
  InvalidArgumentError,
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
   * @param {OptionDeclaration|OptionDeclaration[]}
   */
  declare(options) {}
  
  /**
   * Process process.argv array to get an object implementation of the cli options
   * 
   * @returns {CliOptions}
   */
  exec() {}
  
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