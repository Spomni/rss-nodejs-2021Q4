const { isInDebugMode, isKnownError } = require('./cli-helper')
const { ArgvParser } = require('./argv-parser')
const { cipher } = require('./cipher')

const cliOptionsConfig = require('./cli-options-config')

const UNKNOWN_ERR_MSG = 'Unknown error. For more information, run the application with the --debug option.\n\n'

try {

  const parser = new ArgvParser(cliOptionsConfig)
  const options = parser.exec()
  cipher(options)

} catch (err) {

  if (isKnownError(err)) {
    process.stderr.end(err.message)
  } else {
    process.stderr.end(UNKNOWN_ERR_MSG)
  }

  if (isInDebugMode()) console.log(err)

  process.exit(1)
}
