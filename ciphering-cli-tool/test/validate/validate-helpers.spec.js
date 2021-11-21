const {
  testPath,
  getIOFilesHelpers,
} = require('../lib/test-file-helpers')

const {
  validateConfig,
  validateInput,
  validateOutput,
} = require('../../lib/validate/validate-helpers')

const {
  inputPath,
  outputPath,
  clearIOFiles,
  removeIOFiles,
} = getIOFilesHelpers('validate-helpers')

describe('validate-helpers.js', () => {

  beforeAll(clearIOFiles)
  afterAll(removeIOFiles)

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

    it('Should not throw any error if input is valid', function () {
      clearIOFiles()
      expect(() => validateInput(inputPath)).not.toThrow()
    })
  });

  describe('validateOutput()', () => {

    it('Should throw an error if the function is called without arguments',function () {
      expect(() => validateOutput()).toThrow()
    })

    it('Should throw an error if no access to write file', function () {
      expect(() => validateOutput('no-file')).toThrow()
    })

    it('Should throw an error if passed file is direcvtory', function () {
      expect(() => validateOutput(testPath)).toThrow()
    })

    it('Should not throw any error if output is valid', function () {
      clearIOFiles()
      expect(() => validateOutput(outputPath)).not.toThrow()
    })
  });

  describe('validateConfig()', () => {

    it('Should throw an error if the function is called without arguments', function () {
      expect(() => validateConfig()).toThrow()
    })

    it('Should throw an error if passed config is not string', function () {
      expect(() => validateConfig({})).toThrow()
    })

    it('Should throw an error if config starts from a dash', function () {
      expect(() => validateConfig('-A')).toThrow()
    })

    it('Should throw an error if config ends with a dash', function () {
      expect(() => validateConfig('R1-')).toThrow()
    })

    it('Should throw an error if any config command has unknown cipher', function () {

      const fixture = [
        'A-R1-K1',
        'R0-C0-B',
        'C1-A-U0'
      ]

      fixture.forEach((config) => {
        expect(() => validateConfig(config)).toThrow()
      })
    })

    it('Should throw an error if any config command has invalid ciphering direction', function () {

      const fixture = [
        'A-R1-C3',
        'R0-C0-A1',
        'C1-A-RW'
      ]

      fixture.forEach((config) => {
        expect(() => validateConfig(config)).toThrow()
      })
    })

    it('Should throw an error if any config command has invalid length',function () {

      const fixture = [
        'A-R1-C11',
        'R02-C0-A',
        'C1--R1'
      ]

      fixture.forEach((config) => {
        expect(() => validateConfig(config)).toThrow()
      })
    })

    it('Should not throw any error if config is valid', function () {
      const config = 'A-C0-C1-R0-R1'
      expect(() => validateConfig(config)).not.toThrow()
    })
  });
});
