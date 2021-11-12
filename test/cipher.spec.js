const { PassThrough } = require('stream')
const fs = require('fs/promises')
const path = require('path')

const { assert } = require("chai")
const { spy } = require('sinon')

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

const inputPath = path.resolve(__dirname, './fixture/input')
const outputPath = path.resolve(__dirname, './fixture/output')

async function mockStdout(callback) {
  const { stdout } = process
  const output = new PassThrough()
  
  Object.defineProperty(process, 'stdout', {
    writable: true,
    enumarable: true,
    value: output
  })
  
  try {
    await callback(stdout)
  } finally {
    Object.defineProperty(process, 'stdout', {
      writable: true,
      enumarable: true,
      value: stdout
    })
  }
}

async function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('cipher', function () {

  after(async () => {
    await fs.writeFile(inputPath, '')
    await fs.writeFile(outputPath, '')
  })

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

    it('Should read from the stdin and write to the stdout', async () => {

      await mockStdout(async (stdout) => {
        cipher({ config: 'A' })
        
        const handleData = spy()
        
        process.stdout.once('data', handleData)
        
        process.stdin.push(`asd`)
        process.stdin.pause()
        
        await timeout(0)
        
        assert(handleData.called)
      })
    })

    it('Should read from the file described on the input option', async () => {
      const strArr = ['abc', 'zyx']
      
      await fs.writeFile(inputPath, strArr[0])
      
      await mockStdout((stdout) => {
        process.stdout.once('data', (data) => {
          const string = data.toString()
          assert.strictEqual(string, strArr[1])
        })

        cipher({
          config: 'A',
          input: inputPath,
        })
      })
    })

    it('Should write to the end of file described on the output option', async () => {
      const input = 'abc'
      const outputInitial = input
      const outputGoal = outputInitial + 'zyx'
      
      await fs.writeFile(inputPath, input)
      await fs.writeFile(outputPath, outputInitial)

      cipher({
        config: 'A',
        input: inputPath,
        output: outputPath,
      })
      
      await timeout(10)
      
      const outputContent = await fs.readFile(outputPath, 'utf8')
      assert.strictEqual(outputContent, outputGoal)
    })

    it('Should write to the output every times when input takes data', async () => {
      const strArr = [
        ['a', 'az'],
        ['b', 'azy'],
        ['c', 'azyx']
      ]
      
      await fs.writeFile(outputPath, 'a')

      cipher({
        config: 'A',
        output: outputPath,
      })
      
      try {
        for (let [input, output] of strArr) {
          process.stdin.push(input)
          await timeout(10)
        
          const content = await fs.readFile(outputPath, 'utf8')
          assert.strictEqual(content, output)
        }
      } finally {
        process.stdin.pause()
      }
    })
  })
})