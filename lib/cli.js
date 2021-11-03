const { parser } = require('./argv-parser')
const { cipher } = require('./cipher')

const {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
} = require('./cli-helpers')

const cliOptionsConfig = require('./cli-options-config')

const UNKNOWN_ERR_MSG = 'Unknown error. For more information, run the application with the --debug option.\n'

try {

  parser
    .config(cliOptionsConfig)
    .exec()

  const cliOptions = parser.getOptions()
  const cipherOptions = extractCipherOptions(cliOptions)

  cipher(cipherOptions)

} catch (err) {

  if (isKnownError(err)) {
    process.stderr.end(err.message + '\n')
  } else {
    process.stderr.end(UNKNOWN_ERR_MSG)
  }

  if (isInDebugMode()) {
    console.log('')
    console.log(err)
  }

  process.exit(1)
}
