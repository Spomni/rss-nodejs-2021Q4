const { parser, InputError } = require('../argv-parser')
const { cipher } = require('../cipher')

const {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
  validateCipherOptions,
  killCli,
  writeStderr,
} = require('./cli-helpers')

const parserConfig = require('./cli-parser-config')

const UNKNOWN_ERR_MSG = 'Unknown error. For more information, run the application with the --debug option.'

function cli() {
  try {

    const cliOptions = parser.config(parserConfig).exec()
    const cipherOptions = extractCipherOptions(cliOptions)

    validateCipherOptions(cipherOptions)

    cipher(cipherOptions)

  } catch (err) {

    if (isKnownError(err)) {
      writeStderr(err.message)
      // process.stderr.write(err.message + '\n')
    } else {
      writeStderr(UNKNOWN_ERR_MSG)
      // process.stderr.write(UNKNOWN_ERR_MSG)
    }

    if (isInDebugMode()) {
      console.log('\n', err)
    }

    killCli(1)
  }
}

module.exports = {
  cli,
}