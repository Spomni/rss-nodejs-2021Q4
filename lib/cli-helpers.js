const { ArgvParserError } = require('./argv-parser')
const { CipherError } = require('./cipher')

function isInDebugMode() {
  return process.argv.includes('--debug')
}

function isKnownError(value) {
  return value instanceof Error && (
    value instanceof ArgvParserError ||
    value instanceof CipherError
  )
}

function extractCipherOptions(cliOptions) {
  return {
    config: cliOptions['--config'],
    input: cliOptions['--input'],
    output: cliOptions['--output'],
  }
}

module.exports = {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
}