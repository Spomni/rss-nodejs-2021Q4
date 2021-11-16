const { spawn } = require('child_process')
const fs = require('fs/promises')
const { assert } = require('chai')

const {
  spawnToTest,
  spawnSeriesToTest,
  spawnParallelToTest,
  seriesByArgs,
} = require('./lib/spawn-to-test')

const ERR_REG_EXP_ = require('./lib/cli-errors-reg-exp')

const cliPath = 'lib/cli'
const inputPath = 'test/fixture/cli-input'
const outputPath = 'test/fixture/cli-output'

const ioDelay = 200

async function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

async function clearIOFiles() {
  await fs.writeFile(inputPath, '')
  await fs.writeFile(outputPath, '')
}

async function removeIOFiles() {
  await fs.unlink(inputPath)
  await fs.unlink(outputPath)
}

async function spawnForTest({ execString, handleSpawn, handleClose}) {
  return new Promise((resolve, reject) => {

    const command = execString.split(' ')[0]
    const args = execString.split(' ').filter((v, i) => i > 0)

    const subProcess = spawn(command, args)

    let error = null
    let subout =''
    let suberr = ''

    subProcess.on('error', (err) => {
      error = err
      subProcess.stdin.end()
    })
    subProcess.stdout.on('data', (data) => subout += data.toString())
    subProcess.stderr.on('data', (data) => suberr += data.toString())

    if (handleSpawn) {
      subProcess.on('spawn', async () => {
        try {
          await handleSpawn({ subProcess })
        } catch (err) {
          error = err
          subProcess.kill()
        }
      })
    }

    subProcess.on('close', async (code, signal) => {
      if (error) reject(error)
      if (suberr.length) reject(new Error(suberr))

      if (handleClose) {
        try {
          await handleClose({ subProcess, error, subout, suberr, code, signal })
        } catch (err) {
          reject(err)
        }
      }

      resolve()
    })
  })
}

describe('cli', function () {

  beforeEach(async () => await clearIOFiles())
  afterAll(async () => await removeIOFiles())

  describe('Should print to the stderr human friendly errors and should exit with non-zero code:', function () {

    it('if no option is passed', async function () {
      await spawnToTest({

        args: [`${cliPath}`],

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.FIRST_ARG_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if invalid option name is passed', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -config`,
          `${cliPath} --i`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_OPT_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if any unknown option is passed', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -c A --conf`,
          `${cliPath} -c R1 --price`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.UNKNOWN_OPT_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if any value passed to the --debug option', async function () {
      await spawnToTest({

        args: `${cliPath} -c C0 --debug true`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.FLAG_VALUE_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if more than one value passed to to option --config, --input, --output or their aliases', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} --config a b`,
          `${cliPath} -c s d`,
          `${cliPath} --input a b`,
          `${cliPath} -i a s`,
          `${cliPath} --output a a`,
          `${cliPath} -o a s w d`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.UNEXPECTED_VAL_ARR_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the option --config is missed', async function () {
      await spawnToTest({

        args: `${cliPath} --input input.txt`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.MISS_REQUIRED_OPT_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if no value is passed to option --config, --input or --output', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} --config`,
          `${cliPath} -c A -i`,
          `${cliPath} -c A --output`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.MISS_OPT_VAL_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if any option or its alias is passed more than one times', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} --config A -c R1`,
          `${cliPath} -c A -i a --input d -i a`,
          `${cliPath} -c A --output d -c a`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.DUPLICATED_OPT_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if input option lead to a non-existent file', async function () {
      await spawnToTest({

        args: `${cliPath} --config A -i no-file`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.NO_READ_ACCESS_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if input option lead to a directory', async function () {
      await spawnToTest({

        args: `${cliPath} --config A -i lib`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INPUT_IS_DIR_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if output option lead to a non-existent file', async function () {
      await spawnToTest({

        args: `${cliPath} --config A -o no-file`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.NO_WRITE_ACCESS_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if input option lead to a directory', async function () {
      await spawnToTest({

        args: `${cliPath} --config A -o lib`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.OUTPUT_IS_DIR_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if the --config option is started with dash', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} --config "-A"`,
          `${cliPath} -c "-C1"`,
          `${cliPath} -c "--"`,
          `${cliPath} -c "-"`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.DASHED_CONF_START_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the --config option is ended with dash', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} --config "A-"`,
          `${cliPath} -c "C1--"`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.DASHED_CONF_END_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if any command of the --config option has wrong length', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -c "C13"`,
          `${cliPath} -c R0a`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.TOO_LONG_COMMAND_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the --config option has unknown cipher', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -c "W1"`,
          `${cliPath} -c T0`,
          `${cliPath} -c a`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.UNKNOWN_CIPHER_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the --config option has no direction for the C or R cipher', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -c "C"`,
          `${cliPath} -c R`,
          `${cliPath} -c A-R-A`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_DIRECTION_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the --config option has a direction for the A cipher', async function () {
      await spawnToTest({

        args: `${cliPath} -c A1`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_DIRECTION_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if the --config option has a direction other than 0 or 1', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${cliPath} -c "C2"`,
          `${cliPath} -c R3`,
          `${cliPath} -c A-Rs-A`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_DIRECTION_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })
  })

  describe('input', function(){

    afterEach(async () => await clearIOFiles())

    it('Should read from the file if --input or -i option is passed', async function () {

      const input = 'aBc'
      const output = 'zYx'

      await fs.writeFile(inputPath, input)

      await spawnToTest({

        args: `${cliPath} -c A -i ${inputPath}`.split(' '),

        handleClose({ subout, code }) {
          expect(subout).toBe(output)
          expect(code).toBe(0)
        }
      })
    })

    it('Should read from the stdin if the --input option is not passed', async function () {

      const input = 'aBc'
      const output = 'bCd'

      await spawnToTest({

        args: `${cliPath} -c C1`.split(' '),

        handleSpawn({ subProcess }) {
          subProcess.stdin.write(input)
          subProcess.stdout.on('data', () => {
            subProcess.kill()
          })
        },

        handleClose({ subout }) {
          expect(subout).toBe(output)
        }
      })
    })

    it('Should allow to enter more than one line if reading from standard input', async function () {

      const fixtures = ['A', '_', 'Л']

      await spawnToTest({

        args: `${cliPath} -c C0`.split(' '),

        async handleSpawn({ subProcess }) {
          for (let input of fixtures) {
            subProcess.stdin.write(input)
            await timeout(ioDelay)
          }

          subProcess.exitCode = 0
          subProcess.kill()
        },

        handleClose({ subout, code }) {
          expect(subout).toHaveLength(3)
          expect(code).toBe(0)
        },
      })
    })
  });

  describe('output', function () {

    afterAll(async () => {
      await fs.writeFile(inputPath, '')
      await fs.writeFile(outputPath, '')
    })

    it('Should write to the file if --output or -o options is passed', async function () {

      const fixture = ['asd', 'zhw']

      await fs.writeFile(inputPath, fixture[0])
      await fs.writeFile(outputPath, '')

      const execString = `node lib/cli -c A -i ${inputPath} -o ${outputPath}`

      const handleSpawn = () => {}

      const handleClose = async () => {
        const outputContent = await fs.readFile(outputPath, 'utf-8')
        assert.strictEqual(outputContent, fixture[1])
      }

      await spawnForTest({ execString, handleClose, handleSpawn })
    })

    it('Should not overwrite existing file content', async function () {

      const fixture = ['asd', 'zhw']

      await fs.writeFile(inputPath, fixture[0])
      await fs.writeFile(outputPath, fixture[0])

      const execString = `node lib/cli -c A -i ${inputPath} -o ${outputPath}`

      const handleSpawn = () => {}

      const handleClose = async () => {
        const outputContent = await fs.readFile(outputPath, 'utf-8')
        assert.strictEqual(outputContent, fixture.join(''))
      }

      await spawnForTest({ execString, handleClose, handleSpawn })
    })

    it('Should write to the stdout if the --output option is not passed', async function () {

      const inputString = 'abc'
      const outputString = 'zyx'

      let counter = 0

      await fs.writeFile(inputPath, inputString)
      await fs.writeFile(outputPath, inputString)

      await spawnForTest({

        execString: `node lib/cli -c A --output ${outputPath}`,

        async handleSpawn({ subProcess }) {
          const inputArray = inputString.split('')

          for (let chunk of inputArray) {
            subProcess.stdin.write(chunk)
            await timeout(ioDelay)

            counter += 1
            const expectedContent = inputString + outputString.slice(0, counter)
            const outputContent = await fs.readFile(outputPath, 'utf-8')

            assert.strictEqual(outputContent, expectedContent)
          }

          subProcess.kill('SIGTERM')
        },

        async handleClose() {
          assert.strictEqual(counter, 3)
        }
      })
    })

    it('Should write to stdout every times when stdin is pushed', async function () {

      const inputString = 'abc'
      const outputString = 'zyx'

      let counter = 0

      await spawnForTest({

        execString: `node lib/cli -c A`,

        async handleSpawn({ subProcess }) {
          const inputArray = inputString.split('')

          const handleData = (data) => {
            try {
              assert.strictEqual(data.toString(), outputString[counter])
            } catch (err) {
              subProcess.stdout.off('data', handleData)
            }
            counter += 1
          }

          subProcess.stdout.on('data', handleData)

          for (let chunk of inputArray) {
            subProcess.stdin.write(chunk)
            await timeout(ioDelay)
          }

          subProcess.kill()
        },

        async handleClose() {
          assert.strictEqual(counter, 3)
        }
      })
    })

    it('Should write to the file every times when stdin is pushed', async function () {

      const inputString = 'abc'
      const outputString = 'zyx'

      let counter = 0

      await fs.writeFile(outputPath, inputString)

      await spawnForTest({

        execString: `node lib/cli -c A -o ${outputPath}`,

        async handleSpawn({ subProcess }) {
          const inputArray = inputString.split('')

          for (let chunk of inputArray) {
            subProcess.stdin.write(chunk)
            await timeout(ioDelay)

            counter +=1
            const expectedContent = inputString + outputString.slice(0, counter)
            const outputContent = await fs.readFile(outputPath, 'utf-8')

            assert.strictEqual(outputContent, expectedContent)
          }

          subProcess.kill()
        },

        async handleClose() {
          assert.strictEqual(counter, 3)
        }
      })
    })
  })

  describe('ciphering', function () {
    it.todo('Should cipher only english alphabet symbols')
  })

  describe('examples', function () {

    afterAll(async () => {
      await fs.writeFile(inputPath, '')
      await fs.writeFile(outputPath, '')
    })

    this.beforeEach(async () => {
      await fs.writeFile(inputPath, '')
      await fs.writeFile(outputPath, '')
    })

    it(`-c "C1-C1-R0-A" -i "${inputPath}" -o "${outputPath}"`, async () => {

      const options = `-c "C1-C1-R0-A" -i "${inputPath}" -o "${outputPath}"`
      const input = `This is secret. Message about "_" symbol!`
      const output = `Myxn xn nbdobm. Tbnnfzb ferlm "_" nhteru!`

      await fs.writeFile(inputPath, input)

      await spawnForTest({

        execString: `node lib/cli ${options}`,

        async handleSpawn() {
          await timeout(ioDelay)
        },

        async handleClose() {
          const outputContent = await fs.readFile(outputPath, 'utf-8')
          assert.strictEqual(outputContent, output)
        }
      })
    })

    it(`-c "C1-C0-A-R1-R0-A-R0-R0-C1-A" -i "${inputPath}" -o "${outputPath}"`, async () => {

      const options = `-c "C1-C0-A-R1-R0-A-R0-R0-C1-A" -i "${inputPath}" -o "${outputPath}"`
      const input = `This is secret. Message about "_" symbol!`
      const output = `Vhgw gw wkmxkv. Ckwwoik onauv "_" wqcnad!`

      await fs.writeFile(inputPath, input)

      await spawnForTest({

        execString: `node lib/cli ${options}`,

        async handleSpawn() {
          await timeout(ioDelay)
        },

        async handleClose() {
          const outputContent = await fs.readFile(outputPath, 'utf-8')
          assert.strictEqual(outputContent, output)
        }
      })
    })

    it(`-c "A-A-A-R1-R0-R0-R0-C1-C1-A" -i "${inputPath}" -o "${outputPath}"`, async () => {

      const options = `-c "A-A-A-R1-R0-R0-R0-C1-C1-A" -i "${inputPath}" -o "${outputPath}"`
      const input = `This is secret. Message about "_" symbol!`
      const output = `Hvwg wg gsqfsh. Asggous opcih "_" gmapcz!`

      await fs.writeFile(inputPath, input)

      await spawnForTest({

        execString: `node lib/cli ${options}`,

        async handleSpawn() {
          await timeout(ioDelay)
        },

        async handleClose() {
          const outputContent = await fs.readFile(outputPath, 'utf-8')
          assert.strictEqual(outputContent, output)
        }
      })
    })

    it(`-c "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -i "${inputPath}" -o "${outputPath}"`, async () => {

      const options = `-c "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -i "${inputPath}" -o "${outputPath}"`
      const input = `This is secret. Message about "_" symbol!`
      const output = `This is secret. Message about "_" symbol!`

      await fs.writeFile(inputPath, input)

      await spawnForTest({

        execString: `node lib/cli ${options}`,

        async handleSpawn() {
          await timeout(ioDelay)
        },

        async handleClose() {
          const outputContent = await fs.readFile(outputPath, 'utf-8')
          assert.strictEqual(outputContent, output)
        }
      })
    })
  })
})
