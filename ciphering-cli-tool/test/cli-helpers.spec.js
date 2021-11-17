const mockArgv = require('mock-argv')

const {
  isInDebugMode,
  isKnownError,
} = require('../lib/cli/cli-helpers')

const { InputError } = require('../lib/argv-parser')
const { ValidationError } = require('../lib/cli/cli-validation-errors')

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
      const error = new ValidationError()
      expect(isKnownError(error)).toBe(true)
    })

    it('Should return false otherwise', function () {
      ;[null, new Error, 'error', {}].forEach((error) => {
        expect(isKnownError(error)).toBe(false)
      })
    })
  })
  
  describe('extractCipherOptions', function () {
    it.todo('Should return object with properties "config", "input", "output"')
    it.todo('Should return same properties values thats is passed')
    it.todo('Should retern null if option is not passed')
  })
  
  describe('killCli', function () {
    it.todo('Should call procces.exit() with passed value')
  })
  
  describe('writeStderr', function () {
    it.todo('Should write passed value to process.stderr')
    it.todo('Should append passed value with line break')
  })
  
  describe('validateCipherOptions():', function () {
    it.todo('Should call the validateInput() function')
    it.todo('Should call the validateOutput() function')
    it.todo('Should call the validateConfig() function')
  })
})
