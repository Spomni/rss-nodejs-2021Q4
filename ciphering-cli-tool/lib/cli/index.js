const { parser } = require('../argv-parser')
const { cipher } = require('../cipher')

const {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
  validateCipherOptions,
} = require('./cli-helpers')

const parserConfig = require('./cli-parser-config')

const UNKNOWN_ERR_MSG = 'Unknown error. For more information, run the application with the --debug option.\n'

try {

  const cliOptions = parser.config(parserConfig).exec()
  const cipherOptions = extractCipherOptions(cliOptions)

  validateCipherOptions(cipherOptions)

  cipher(cipherOptions)

} catch (err) {

  if (isKnownError(err)) {
    process.stderr.write(err.message + '\n')
  } else {
    process.stderr.write(UNKNOWN_ERR_MSG)
  }

  if (isInDebugMode()) {
    console.log('\n', err)
  }

  process.exit(1)
}
