const jestExtended = require('jest-extended')

const { mockStderr } = require('./__helpers/mock-std-io')
const { cli } = require('../lib/cli/cli')

expect.extend(jestExtended)
jest.mock('../lib/argv-parser')
jest.mock('../lib/cipher')
jest.mock('../lib/cli/cli-helpers')
jest.mock('../lib/cli/cli-parser-config')

const parserConfig = require('../lib/cli/cli-parser-config')
const { parser } = require('../lib/argv-parser')
const { cipher } = require('../lib/cipher')

const {
  validateCipherOptions,
  extractCipherOptions,
  isKnownError,
  writeStderr,
  killCli,
  isInDebugMode,
} = require('../lib/cli/cli-helpers')

const parsedOptions = {}

const cipherOptions = {}

const UNKNOWN_ERR_MSG = 'Unknown error. For more information, run the application with the --debug option.'

parser.config.mockReturnThis()
parser.exec.mockReturnValue(parsedOptions)
extractCipherOptions.mockReturnValue(cipherOptions)

describe('cli', function () {

  it('Should parse cli options using cli-parser-config', function () {
    cli()
    expect(parser.config).toHaveBeenCalledWith(parserConfig)
    expect(parser.exec).toHaveBeenCalledAfter(parser.config)
  })

  it('Should convert cli options to cipher one', function () {
    expect(extractCipherOptions).toHaveBeenCalledWith(parsedOptions)
  })

  it('Should validate cipher options', function () {
    expect(validateCipherOptions).toHaveBeenCalledWith(cipherOptions)
  })

  it('Should call cipher with converted options', function () {
    expect(cipher).toHaveBeenCalledWith(cipherOptions)
  })

  it('Should catch all errors', async () => {
    await mockStderr(async () => {
      parser.exec.mockImplementationOnce(() => { throw new Error() })
      expect(() => cli()).not.toThrow()
    })
  })

  it('Should write to stderr a message of the catched errors if it is known', function () {

    const message = 'message'

    parser.exec.mockImplementationOnce(() => { throw new Error(message) })
    isKnownError.mockReturnValueOnce(true)

    cli()

    expect(isKnownError).toHaveBeenCalled()
    expect(writeStderr).toHaveBeenLastCalledWith(message)
  })

  it('Should print a human friendly message if an unknown error is catched', function () {

    parser.exec.mockImplementationOnce(() => { throw new Error() })
    isKnownError.mockReturnValueOnce(false)

    cli()

    expect(writeStderr).toHaveBeenLastCalledWith(UNKNOWN_ERR_MSG)
  })

  it('Should exit with non-zero code if any error is catched', function () {
    parser.exec.mockImplementationOnce(() => { throw new Error() })
    cli()
    expect(killCli).toHaveBeenLastCalledWith(1)
  })

  it('Should log catched error if it started in the debug mode', async function () {

    const logMock = jest.spyOn(global.console, 'log').mockImplementation()
    const error = new Error('asd')

    parser.exec.mockImplementationOnce(() => { throw error })
    isInDebugMode.mockReturnValueOnce(true)

    cli()

    expect(logMock).toHaveBeenLastCalledWith('\n', error)

    logMock.mockRestore()
  })
})
