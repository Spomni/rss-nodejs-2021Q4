const { assert } = require('chai')
const sinon = require('sinon')
const { ArgvParser } = require('../lib/argv-parser')

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
    it('Should throw an error if the third argv item is not option')
    it('Should throw an error if the argv array contains not valid option name')
    it('Should throw an error if the argv array contains unknown option')
    it('Should throw an error if the some value is passed to the flag option')
    it('Should throw an error if more then one values are passed to the non-array option')
    it('Should throw an error if any required option is not passed')
    it('Should return a result of the .getAll() method')
  })
  
  describe('.getAll()', function () {
    it('Should return an object with all declared options and aliases')
    it(`Should return options with their correct values`)
    it('Should copy options values to their aliases.')
    it('Should set missed flag options to false')
    it('Should set missed array options to empty array')
    it('Should set missed string options to null')
  })
})
