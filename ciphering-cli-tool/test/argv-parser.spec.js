const mockProps = require('jest-mock-props')
mockProps.extend(jest);

const { mockArgv } = require('./lib/mock-argv')

const {
  ArgvParser,
  ArgvParserError,
  InputError
} = require('../lib/argv-parser')

const {
  FirstArgumentError,
  InvalidOptionsError,
  UnknownOptionNameError,
  FlagOptionValueError,
  UnexpectedValuesArrayError,
  MissedRequiredOptionError,
  MissedOptionValueError,
  DuplicatedOptionError,
} = require('../lib/argv-parser/argv-parser-errors')

function testInputError(fixtures, ErrorClass, parser = null) {
  const parserToExec = parser || new ArgvParser()

  fixtures.forEach((argv) => {
    mockArgv(argv, () => {
      expect(() => parserToExec.exec()).toThrow(ErrorClass)
    })
  })
}

describe('ArgvParser', function () {

  describe('.config()', function () {

    it('Should throw an error if configuration is not passed', function () {
      const parser = new ArgvParser()
      expect(() => parser.config()).toThrow(ArgvParserError)
    })

    it('Should call the .declare() method with declare option if it is passed in config', function () {
      const parser = new ArgvParser()
      const declare = {}

      const spy = jest.spyOn(parser, 'declare')
        .mockImplementation()

      parser.config({ declare })
      expect(spy).toHaveBeenCalledWith(declare)

      spy.mockRestore()
    })

    it('Should return this ArgvParser instance', function () {
      const parser = new ArgvParser()
      const config = { declare: { name: '-c'} }

      expect(parser.config({})).toBe(parser)
      expect(parser.config(config)).toBe(parser)
    })
  })

  describe('.declare()', function () {

    it('Should throw an error if the argument is not object or array', function () {
      const parser = new ArgvParser()

      ;[undefined, null, 3, 'str']
        .forEach((declare) => {
          expect(() => parser.declare(declare)).toThrow(ArgvParserError)
        })

      ;[{ name: '--option'}, [{ name: '-o' }]]
        .forEach((declare) => {
          expect(() => parser.declare(declare)).not.toThrow(declare)
        })
    })

    it('Should throw an error if any option does not have the "name" property ', function () {
      const parser = new ArgvParser()

      const tryDeclare = () => parser.declare([
        { name: `--option` },
        { isFlag: true }
      ])

      expect(tryDeclare).toThrow(ArgvParserError)
    })

    it('Should throw an error if the any options name is invalid', function () {
      const parser = new ArgvParser()

      ;[
        { name: '' },
        { name: 'o' },
        { name: '-' },
        { name: '--' },
        { name: '---' },
        { name: '-cc' },
        { name: '--c' },
        { name: '---conf' },

      ].forEach((arg) => {
        expect(() => parser.declare(arg)).toThrow(ArgvParserError)
      })
    })

    it('Should throw an error if the alias parameter is not an array of the options names', function () {
      const parser = new ArgvParser()

      ;[
        { name: `--conf`, alias: '-c' },
        { name: `--conf`, alias: ['-'] },
        { name: `--conf`, alias: ['asd'] },

      ].forEach((arg) => {
        expect(() => parser.declare(arg)).toThrow(ArgvParserError)
      })
    })

    it('Should throw an error if a passed option name has already been declared or aliased', function () {
      const parser = new ArgvParser()
      parser.declare({
        name: '--debug',
        alias: ['-d']
      })

      ;[
        { name: '--debug' },
        { name: '-d' },

      ].forEach((arg) => {
        expect(() => parser.declare(arg)).toThrow(ArgvParserError)
      })
    })

    it('Should throw an error if both parameters "isFlag" and "isArray" are true', () => {
      const parser = new ArgvParser()

      const tryDeclare = () => parser.declare({
        name: '--debug',
        isFlag: true,
        isArray: true,
      })

      expect(tryDeclare).toThrow(ArgvParserError)
    })
  })

  describe('.exec()', function () {

    it('Should throw an error if the third argv item is not option', function () {
      const parser = new ArgvParser()

      mockArgv(['debug'], () => {
        expect(() => parser.exec()).toThrow(FirstArgumentError)
      })
    })

    it('Should throw an error if the argv array contains not valid option name', function() {

      const fixtures = [
        ['--conf', '-debug'],
        ['-c', 'a', `--d`]
      ]

      testInputError(fixtures, InvalidOptionsError)
    })

    it('Should throw an error if the argv array contains unknown option', async function () {

      const parser = new ArgvParser()
      parser.declare({ name: '--debug' })

      const fixtures = [
        ['--conf', '--debug'],
        ['-c', '--debug']
      ]

      testInputError(fixtures, UnknownOptionNameError, parser)
    })

    it('Should throw an error if the some value is passed to the flag option', async function() {
      const parser = new ArgvParser()

      parser.declare({
        name: '--debug',
        isFlag: true,
      })

      mockArgv(['--debug', '"value"'], () => {
        expect(() => parser.exec()).toThrow(FlagOptionValueError)
      })
    })

    it('Should throw an error if more then one values are passed to the non-array option', async function() {
      const parser = new ArgvParser()

      parser.declare({
        name: '--input',
        isFlag: false,
      })

      mockArgv(['--input', './in.js', 'stdin'], () => {
        expect(() => parser.exec()).toThrow(UnexpectedValuesArrayError)
      })
    })

    it('Should throw an error if any required option is not passed', async function () {
      const parser = new ArgvParser()

      parser.declare([
        {
          name: '--debug',
          isFlag: true,
          isRequired: true
        },
        {
          name: '--input',
          isRequired: true
        }
      ])

      mockArgv(['--debug'], () => {
        expect(() => parser.exec()).toThrow(MissedRequiredOptionError)
      })
    })

    it(`Should throw an error if the value of the non-flagable options is not passed`, async function() {
      const parser = new ArgvParser()

      parser.declare([
        {
          name: '--debug',
          isFlag: true,
          isRequired: true
        },
        {
          name: '--input',
          isRequired: true
        }
      ])

      mockArgv(['--input', '--debug'], () => {
        expect(() => parser.exec()).toThrow(MissedOptionValueError)
      })
    })

    it('Should throw an error if any option is duplicated', () => {
      const parser = new ArgvParser()

      parser.declare([
        {
          name: '--debug',
          isFlag: true,
          isRequired: true
        },
        {
          name: '--input',
          alias: ['-i'],
          isRequired: true
        }
      ])

      mockArgv(['--input', 'in', '-i', 'in'], () => {
        expect(() => parser.exec()).toThrow(DuplicatedOptionError)
      })
    })

    it('Should return a result of the .getAll() method', async function () {
      const parser = new ArgvParser()
      parser.declare({ name: '--debug', isFlag: true })

      const getAllResult = {}

      const getAllMock = jest
        .spyOn(parser, 'getAll')
        .mockReturnValue(getAllResult)

      mockArgv(['--debug'], () => {
        expect(parser.exec()).toBe(getAllResult)
      })

      getAllMock.mockRestore()
    })
  })

  describe('.getAll()', function () {

    const declareConfig = [
      {
        name: '--config',
        alias: ['-c'],
        isArray: true,
      },
      {
        name: '--input',
        alias: ['-i'],
      },
      {
        name: '--debug',
        isFlag: true,
      }
    ]

    const declaredNames = ['--config', '--input', '--debug', '-c', '-i']

    it('Should return null if the .exec() method have not been executed', function () {
      const parser = new ArgvParser()
      expect(parser.getAll()).toBeNull()
    })

    it('Should return an object with all declared options and aliases', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(['--debug'], () => {
        parser.exec()

        ;[...declaredNames, '--debug'].forEach((name) => {
          expect(parser.getAll()).toHaveProperty(name)
        })
      })
    })

    it(`Should return options with their correct values`, async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(
        ['--debug', '-i', './input', '--config', 'set', 'url', 'third'],
        () => {
          parser.exec()
          expect(parser.getAll()).toHaveProperty('--debug', true)
          expect(parser.getAll()).toHaveProperty('-i', './input')
          expect(parser.getAll()).toHaveProperty('--config', ['set', 'url', 'third'])
        }
      )
    })

    it('Should copy options values to their aliases.', async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(
        ['--debug', '-i', './input', '--config', 'set', 'url'],
        () => {
          parser.exec()
          expect(parser.getAll()).toHaveProperty('--input', './input')
          expect(parser.getAll()).toHaveProperty('-c', ['set', 'url'])
        }
      )
    })

    it('Should set missed flag options to false', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(
        ['-i', './input', '--config', 'set', 'url'],
        () => {
          parser.exec()
          expect(parser.getAll()).toHaveProperty('--debug', false)
        }
      )
    })

    it('Should set missed array options to empty array', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(
        ['-i', './input', '--debug'],
        () => {
          parser.exec()
          expect(parser.getAll()).toHaveProperty('--config', [])
        }
      )
    })

    it('Should set missed string options to null', async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      mockArgv(
        ['--debug', '--config', 'set', 'url'],
        () => {
          parser.exec()
          expect(parser.getAll()).toHaveProperty('--input', null)
        }
      )
    })
  })
})