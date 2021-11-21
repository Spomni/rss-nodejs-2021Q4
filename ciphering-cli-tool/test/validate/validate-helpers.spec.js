const { testPath } = require('../lib/test-file-helpers')

const {
  validateConfig,
  validateInput,
  validateOutput,
} = require('../../lib/validate/validate-helpers')

describe('validate-helpers.js', () => {

  describe('validateInput()', () => {

    it('Should throw an error if the function is called without arguments',function () {
      expect(() => validateInput()).toThrow()
    })

    it('Should throw an error if no access to read file', function () {
      expect(() => validateInput('no-file')).toThrow()
    })

    it('Should throw an error if passed file is direcvtory', function () {
      expect(() => validateInput(testPath)).toThrow()
    })
  });

  describe('validateOutput()', () => {
    it.todo('Should throw an error if the function is called without arguments')
    it.todo('Should throw an error if no access to write file')
    it.todo('Should throw an error if passed file is direcvtory')
  });

  describe('validateConfig()', () => {
    it.todo('Should throw an error if the function is called without arguments')
    it.todo('Should throw an error if passed config is not string')
    it.todo('Should throw an error if config starts from a dash')
    it.todo('Should throw an error if config ends with a dash')
    it.todo('Should throw an error if any config command has unknown cipher')
    it.todo('Should throw an error if any config command has invalid ciphering direction')
    it.todo('Should throw an error if any config command has invalid length')
  });
});
