const { assert } = require('chai')

const { validateCipherOptions } = require('../lib/cli/cli-helpers')

const {
  ValidationError,

  MissedConfigError,
  ConfigIsNotStringError,
  DashAtConfigStartError,
  DashAtConfigEndError,
  UnknownCipherError,
  InvalidCipheringDirectionError,
  InvalidCommandLengthError,

  NoAccessToReadError,
  InputIsDirectoryError,

  NoAccessToWriteError,
  OutputIsDirectoryError,
} = require('../lib/cli/cli-errors')


describe('cli-helpers', function () {

  describe('validateCipherOptions()', function () {

    describe('config', function () {

      describe('Should throw an error instance extending the ValidationError class if the config option is not valid', function () {

        const fixture = [
          [undefined, MissedConfigError],
          [{}, ConfigIsNotStringError],
          ['-A', DashAtConfigStartError],
          ['R1-A-', DashAtConfigEndError],
          ['as', UnknownCipherError],
          ['C', InvalidCipheringDirectionError],
          ['A1', InvalidCipheringDirectionError],
          ['RC', InvalidCipheringDirectionError],
          ['C12', InvalidCommandLengthError],
        ]

        fixture.forEach(([config, ErrorClass]) => {
          it(`${ErrorClass.name}`, function () {
            assert.throws(() => validateCipherOptions({ config }), ErrorClass)
          })
        })
      })
    })

    describe('input', function () {
      describe('Should throw an error instance extending the ValidationError class if the "input" option is not valid', function () {

        const fixture = [
          ['./no-file', NoAccessToReadError],
          ['./lib', InputIsDirectoryError]
        ]

        fixture.forEach(([filePath, ErrorClass]) => {
          it(`${ErrorClass.name}`, function () {
            assert.throws(
              () => validateCipherOptions({ input: filePath, config: 'A' }),
              ErrorClass
            )
          })
        })
      })
    })

    describe('output', function () {
      describe('Should throw an error instance extending the ValidationError class if the "output" option is not valid', function () {

        const fixture = [
          ['./no-file', NoAccessToWriteError],
          ['./lib', OutputIsDirectoryError]
        ]

        fixture.forEach(([filePath, ErrorClass]) => {
          it(`${ErrorClass.name}`, function () {
            assert.throws(
              () => validateCipherOptions({ output: filePath, config: 'A' }),
              ErrorClass
            )
          })
        })
      })
    })
  })
})
