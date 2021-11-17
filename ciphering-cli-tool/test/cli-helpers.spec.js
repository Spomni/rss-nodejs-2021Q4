const mockArgv = require('mock-argv')

const {
  isInDebugMode,
} = require('../lib/cli/cli-helpers')

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
    it.todo('Should return true if a passed value is an argv parsing error')
    it.todo('Should return true if a passed value is an options validation error')
    it.todo('Should return false otherwise')
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
