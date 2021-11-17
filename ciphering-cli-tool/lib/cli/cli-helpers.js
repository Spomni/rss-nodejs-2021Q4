const {
  validateConfig,
  validateInput,
  validateOutput,
} = require('./cli-validate-helpers')

const { InputError } = require('../argv-parser')
const { ValidationError, } = require('./cli-validation-errors')

function isInDebugMode() {
  return process.argv.includes('--debug')
}

function isKnownError(value) {
  return value instanceof Error && (
    value instanceof InputError ||
    value instanceof ValidationError
  )
}

function extractCipherOptions(cliOptions) {
  return {
    config: cliOptions['--config'],
    input: cliOptions['--input'],
    output: cliOptions['--output'],
  }
}

function killCli(code) {
  process.exit(code)
}

function writeStderr(message) {
  process.stderr.write(message + '\n')
}

function validateCipherOptions({
  config,
  input,
  output
}) {
  validateConfig(config)
  validateInput(input)
  validateOutput(output)
}

module.exports = {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
  validateCipherOptions,
  killCli,
  writeStderr,
}