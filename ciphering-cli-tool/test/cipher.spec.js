const { PassThrough } = require('stream')
const fs = require('fs/promises')
const path = require('path')

const { assert } = require("chai")
const { spy } = require('sinon')

const { cipher } = require('../lib/cipher')

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

  afterAll(async () => {
    await fs.writeFile(inputPath, '')
    await fs.writeFile(outputPath, '')
  })

  describe('cipher()', function () {

    it('Should read from the stdin and write to the stdout', async () => {

      await mockStdout(async (stdout) => {
        cipher({ config: 'A' })

        const handleData = spy()

        process.stdout.once('data', handleData)

        process.stdin.push(`asd`)
        await timeout(100)
        process.stdin.pause()

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