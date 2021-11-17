
describe('cli-helpers', function () {

  describe('isInDebugMode():', function () {
    it.todo('Should return true if the argv array includes the value "--debug"')
    it.todo('Should return false if the argv array does not include the value "--debug"')
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
  
  describe('validateCipherOptions', function () {
  })
  
  describe('killCli', function () {
  })
  
  describe('writeStderr', function () {
  })
})