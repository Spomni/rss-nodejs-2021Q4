const { assert } = require('chai')
const sinon = require('sinon')
const mockArgv = require('mock-argv')

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
} = require('../lib/argv-parser-errors')

describe('ArgvParser', function () {

  describe('exports', function () {
    it('Should export ArgvParser class')
    it('Should export an instance as the "parser" property')
  })
  
  describe(`constructor()`, function () {
    it('Should not throw any error')
  })

  describe('.config()', function () {
  
    it('Should throw an error if configuration is not passed', function () {
      const parser = new ArgvParser()
      assert.throws(() => parser.config())
    })
    
    it('Should call the .declare() method if the "declare" option is passed', function () {
      const parser = new ArgvParser()
      const config = { declare: { name: '-c'} }
      const spy = sinon.spy(parser, 'declare')
      parser.config(config)
      assert(spy.called)
    })

    it('Should pass a value of the "declare" option to the .declare() method', function () {
      const parser = new ArgvParser()
      const config = { declare: { name: '-c'} }
      const spy = sinon.spy(parser, 'declare')
      parser.config(config)
      assert(spy.calledWith(config.declare))
    })

    it('Should return this ArgvParser instance', function () {
      const parser = new ArgvParser()
      const config = { declare: { name: '-c'} }
      const returned = parser.config(config)
      assert.strictEqual(returned, parser)
    })
  })

  describe('.declare()', function () {

    it('Should throw an error if the argument is not object or array', function () {
      const parser = new ArgvParser()

      assert.throws(() => parser.declare())
      assert.throws(() => parser.declare(3))
      assert.throws(() => parser.declare('str'))

      assert.doesNotThrow(() => parser.declare({ name: '--option' }))
      assert.doesNotThrow(() => parser.declare([{ name: '-o' }]))
    })

    it('Should throw an error if any option does not have the "name" property ', function () {
      const parser = new ArgvParser()
      assert.throws(() => {
        parser.declare([
          { name: `--option` },
          { isFlag: true }
        ])
      })
    })
    
    it('Should throw an error if the any options name is invalid', function () {
      const parser = new ArgvParser()
      assert.throws(() => parser.declare({ name: '' }))
      assert.throws(() => parser.declare({ name: 'o' }))
      assert.throws(() => parser.declare({ name: '-' }))
      assert.throws(() => parser.declare({ name: '--' }))
      assert.throws(() => parser.declare({ name: '---' }))
      assert.throws(() => parser.declare({ name: '-cc' }))
      assert.throws(() => parser.declare({ name: '--c' }))
      assert.throws(() => parser.declare({ name: '---conf' }))
    })
    
    it('Should throw an error if the alias parameter is not an array of the options names', function () {
      const parser = new ArgvParser()
      assert.throws(() => parser.declare({ name: `--conf`, alias: '-c'}))
      assert.throws(() => parser.declare({ name: `--conf`, alias: ['-']}))
    })

    it('Should throw an error if a passed option name has already been declared or aliased', function () {
      const parser = new ArgvParser()
      parser.declare({
        name: '--debug',
        alias: ['-d']
      })

      assert.throws(() => parser.declare({ name: '--debug' }))
      assert.throws(() => parser.declare({ name: '-d' }))
    })
    
    it('Should throw an error if both parameters "isFlag" and "isArray" are true', () => {
      const parser = new ArgvParser()
      
      assert.throws(() => parser.declare({
        name: '--debug',
        isFlag: true,
        isArray: true,
      }))
    })
  })

  describe('.exec()', function () {

    it('Should throw an error if the third argv item is not option', async function () {
      const parser = new ArgvParser()
      await mockArgv(['debug'], () => {
        assert.throws(() => parser.exec(), InputError)
      })
      await mockArgv(['debug'], () => {
        assert.throws(() => parser.exec(), FirstArgumentError)
      })
    })

    it('Should throw an error if the argv array contains not valid option name', async function() {
      const parser = new ArgvParser()
      await mockArgv(['--conf', '-debug'], () => {
        assert.throws(() => parser.exec(), InputError)
      })
      await mockArgv(['-c', 'a', `--d`], () => {
        assert.throws(() => parser.exec(), InvalidOptionsError)
      })
    })
    
    it('Should throw an error if the argv array contains unknown option', async function () {
      const parser = new ArgvParser()
      parser.declare({ name: '--debug' })

      await mockArgv(['--conf', '--debug'], () => {
        assert.throws(() => parser.exec(), UnknownOptionNameError)
      })
      await mockArgv(['-c', '--debug'], () => {
        assert.throws(() => parser.exec(), UnknownOptionNameError)
      })
    })

    it('Should throw an error if the some value is passed to the flag option', async function() {
      const parser = new ArgvParser()

      parser.declare({
        name: '--debug',
        isFlag: true,
      })
      
      await mockArgv(['--debug', 'simple'], () => {
        assert.throws(() => parser.exec(), FlagOptionValueError)
      })
    })

    it('Should throw an error if more then one values are passed to the non-array option', async function() {
      const parser = new ArgvParser()
      
      parser.declare({
        name: '--input',
        isFlag: false,
      })

      await mockArgv(['--input', './in.js', 'stdin'], () => {
        assert.throws(() => parser.exec(), UnexpectedValuesArrayError)
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
      
      await mockArgv(['--debug'], () => {
        assert.throws(() => parser.exec(), MissedRequiredOptionError)
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
      
      await mockArgv(['--input', '--debug'], () => {
        assert.throws(() => parser.exec(), MissedOptionValueError)
      })
    })

    it('Should return a result of the .getAll() method', async function () {
      const parser = new ArgvParser()

      parser.declare([
        {
          name: '--config',
          alias: ['-c'],
          isRequired: true,
        },
        {
          name: '--input',
          alias: ['-i'],
        },
        {
          name: '--output',
          alias: ['-o'],
        },
        {
          name: '--debug',
          isFlag: true,
        }
      ])
      
      await mockArgv(['--input', './input', '-c', 'C1'], () => {
        const execRes = parser.exec()
        const getAllRes = parser.getAll()
        assert.deepEqual(execRes, getAllRes)
      })
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
  
    it('Should return null if the .exec() method have not been executed', function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      assert.isNull(parser.getAll())
    })

    it('Should return an object with all declared options and aliases', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)

      await mockArgv(['--debug'], () => {
        parser.exec()
     })

      const result = parser.getAll()

      ;['--config', '--input', '--debug', '-c', '-i'].forEach((name) => {
        assert.property(result, name)
      })
    })

    it(`Should return options with their correct values`, async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      
      await mockArgv(
        ['--debug', '-i', './input', '--config', 'set', 'url'],
        () => parser.exec()
      )

      const result = parser.getAll()

      assert.strictEqual(result['--debug'], true)
      assert.strictEqual(result['-i'], './input')
      assert.deepEqual(result['--config'], ['set', 'url'])
    })

    it('Should copy options values to their aliases.', async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      
      await mockArgv(
        ['--debug', '-i', './input', '--config', 'set', 'url'],
        () => parser.exec()
      )

      const result = parser.getAll()

      assert.strictEqual(result['--input'], './input')
      assert.deepEqual(result['-c'], ['set', 'url'])
    })

    it('Should set missed flag options to false', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      
      await mockArgv(
        ['-i', './input', '--config', 'set', 'url'],
        () => parser.exec()
      )
      
      const result = parser.getAll()
      
      assert.strictEqual(result['--debug'], false)
    })

    it('Should set missed array options to empty array', async function () {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      
      await mockArgv(
        ['-i', './input', '--debug'],
        () => parser.exec()
      )
      
      const result = parser.getAll()
      
      assert.deepEqual(result['--config'], [])
    })

    it('Should set missed string options to null', async function() {
      const parser = new ArgvParser()
      parser.declare(declareConfig)
      
      await mockArgv(
        ['--debug', '--config', 'set', 'url'],
        () => parser.exec()
      )

      const result = parser.getAll()

      assert.strictEqual(result['--input'], null)
    })
  })
})