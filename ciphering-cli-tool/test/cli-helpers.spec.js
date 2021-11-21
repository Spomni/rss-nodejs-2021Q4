const { mockArgv } = require('./__helpers/mock-argv')

const {
  isInDebugMode,
  isKnownError,
  extractCipherOptions,
  killCli,
  writeStderr,
  validateCipherOptions,
} = require('../src/cli/cli-helpers')

const { InputError } = require('../src/argv-parser')

jest.mock('../src/validate', () => {
  const automock = jest.createMockFromModule('../src/validate')
  const { ValidationError } = jest.requireActual('../src/validate')

  return {
    ...automock,
    ValidationError,
  }
})

const {
  validateConfig,
  validateInput,
  validateOutput,

  ValidationError,
} = require('../src/validate')

describe('cli-helpers', function () {

  describe('isInDebugMode():', function () {

    it('Should return true if the argv array includes the value "--debug"', async function () {
      await mockArgv(['--debug'], () => {
        expect(isInDebugMode()).toBe(true)
      })
    })

    it('Should return false if the argv array does not include the value "--debug"', async function () {
      await mockArgv([], () => {
        expect(isInDebugMode()).toBe(false)
      })
    })
  })

  describe('isKnownError():', function () {

    it('Should return true if a passed value is an argv parsing error', function () {
      const error = new InputError()
      expect(isKnownError(error)).toBe(true)
    })

    it('Should return true if a passed value is an options validation error', function () {

      ValidationError.mockRestore

      const error = new ValidationError()
      expect(isKnownError(error)).toBe(true)
    })

    it('Should return false otherwise', function () {
      ;[null, new Error, 'error', {}].forEach((error) => {
        expect(isKnownError(error)).toBe(false)
      })
    })
  })

  describe('extractCipherOptions():', function () {

    it('Should return object with properties "config", "input", "output"', function () {
      const cipherOpts = extractCipherOptions({})
      expect(cipherOpts).toHaveProperty('config')
      expect(cipherOpts).toHaveProperty('input')
      expect(cipherOpts).toHaveProperty('output')
    })

    it('Should return the same properties values thats is passed', function () {
      const cliOpts = {
        '--config': {},
        '--input': {},
        '--outpur': {},
      }

      const cipherOpts = extractCipherOptions(cliOpts)

      expect(cipherOpts.config).toBe(cliOpts['--config'])
      expect(cipherOpts.input).toBe(cliOpts['--input'])
      expect(cipherOpts.output).toBe(cliOpts['--output'])
    })
  })

  describe('killCli():', function () {

    it('Should call procces.exit() with passed value', function () {

      const exitMock = jest.spyOn(global.process, 'exit').mockImplementation(() => {})
      const value = {}

      killCli(value)
      expect(exitMock).toHaveBeenCalledWith(value)

      exitMock.mockRestore()
    })
  })

  describe('writeStderr():', function () {

    it('Should write passed value to process.stderr with trailng line break', function () {

      const stderrWriteMock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {})
      const value = 'message'

      writeStderr(value)
      expect(stderrWriteMock).toHaveBeenCalledWith(value + '\n')

      stderrWriteMock.mockRestore()
    })
  })

  describe('validateCipherOptions():', function () {

    const input = {}
    const output = {}
    const config = {}

    validateCipherOptions({ input, output, config })

    it('Should call the validateInput() function with input value', function() {
       expect(validateInput).toHaveBeenCalledWith(input)
     })

    it('Should call the validateOutput() function with output value', function() {
      expect(validateOutput).toHaveBeenCalledWith(output)
    })

    it('Should call the validateConfig() function with config value', function() {
      expect(validateConfig).toHaveBeenCalledWith(config)
    })
  })
})
