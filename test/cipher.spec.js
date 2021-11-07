const { assert } = require("chai")
const {
  cipher,
  CipherError,
  InvalidConfigError,

  NoAccessToReadError,
  InputIsDirectoryError,

  NoAccessToWriteError,
  OutputIsDirectoryError,
} = require('../lib/cipher')

const {
  MissedConfigError,
  ConfigIsNotStringError,
  DashAtConfigStartError,
  DashAtConfigEndError,
  UnknownCipherError,
  InvalidCipheringDirectionError,
  InvalidCommandLengthError,
} = require('../lib/cipher/cipher-errors')

describe('cipher', function () {

  describe('exports', function () {

    it('Should export a function as cipher propety', () => {
      assert.isFunction(cipher)
    })

    it('Should export the CipherError class extending the Error one', () => {
      assert.instanceOf(new CipherError(), Error)
    })

    it('Should export the InvalidConfigError class extending the CipherError one', () => {
      assert.instanceOf(new InvalidConfigError(), CipherError)
    })

    it('All exported errors classes should extend the CipherError class')
  })

  describe('cipher()', function () {

    it('Should throw a InvalidConfigError instance if the config option is not valid', () => {

      const fixture = [
        [undefined, MissedConfigError],
        [{}, ConfigIsNotStringError],
        ['C', InvalidCipheringDirectionError],
        ['-A', DashAtConfigStartError],
        ['A1', InvalidCipheringDirectionError],
        ['as', UnknownCipherError],
        ['R1-A-', DashAtConfigEndError],
        ['CR', InvalidCipheringDirectionError],
        ['C12', InvalidCommandLengthError],
      ]

      fixture.forEach(([ config ]) => {
        assert.throws(() => cipher({ config }), InvalidConfigError)
      })

      fixture.forEach(([ config, constructor ]) => {
        assert.throws(() => cipher({ config }), constructor)
      })
    })

    it('Should throw a NoAccessToReadError instance if the input file is not accessed to reading', () => {

      const options = { input: './no-file', config: 'A'}
      assert.throws(() => cipher(options), NoAccessToReadError)
    })

    it('Should throw an InputIsDirectoryError instance if the passed input is directory', () => {
      const options = { input: './lib', config: 'A'}
      assert.throws(() => cipher(options), InputIsDirectoryError)
    })

    it('Should throw a NoAccessToWriteError instance if the output file is not accessed to writing', () => {

      const options = { output: './no-file', config: 'A'}
      assert.throws(() => cipher(options), NoAccessToWriteError)
    })

    it('Should throw an OutputIsDirectoryError instance if the passed output is directory', () => {
      const options = { output: './lib', config: 'A'}
      assert.throws(() => cipher(options), OutputIsDirectoryError)
    })

    it('Should read from the stdin if the input option is not passed')
    it('Should read from the file described on the input option')

    it('Should write to the stdout if the output option is not passed')
    it('Should write the file described on the output option')

    it('Should append output to the file content')
    it('Should write to the output every times when input takes data')

    it('Should transform english alphabet symbols only')
    it(`Should transform lowercase and appercase`)
  })
})