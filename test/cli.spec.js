const { spawn, exec } = require('child_process')
const fs = require('fs/promises')
const { assert } = require('chai')
const { createInterface } = require('readline')

const ERR_REG_EXP_ = require('./lib/cli-errors-reg-exp')

const inputPath = 'test/fixture/input'
const outputPath = 'test/fixture/output'

const ioDelay = 100

async function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

async function testCli(fixture, callback) {
  return Promise.all(
    fixture.map((options) => new Promise((resolve, reject) => {
      const command = `node`
      const args = ['lib/cli.js', ...options.split(' ')]

      const subProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let error = null
      let subout =''
      let suberr = ''

      subProcess.on('error', (err) => error = err)
      subProcess.stdout.on('data', (data) => subout += data.toString())
      subProcess.stderr.on('data', (data) => suberr += data.toString())

      subProcess.on('close', () => {
        try {
          callback({ subProcess, error, subout, suberr })
        } catch (error) {
          reject(error)
        }
        resolve()
      })
    }))
  )
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

  describe('Should print to the stderr human friendly errors and should exit with non-zero code:', function () {

    it('if no option is passed', async function () {
      const fixture = ['']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FIRST_ARG_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if invalid option name is passed', async function () {
      const fixture = ['-config', '--i']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any unknown option is passed', async function () {
      const fixture = ['--conf', '--price']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNKNOWN_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any value passed to the --debug option', async function () {
      const fixture = ['--debug true']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FLAG_VALUE_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if more than one value passed to to option --config, --input, --output or their aliases', async function () {
      const fixture = ['--config a b', '-c s d', '--input a b', '-i a s', '--output a a', '-o a s w d']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNEXPECTED_VAL_ARR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the option --config is missed', async function () {
      const fixture = ['--input input.txt']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_REQUIRED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if no value is passed to option --config, --input or --output', async function () {
      const fixture = ['--config', '-c A -i', '-c A --output']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_OPT_VAL_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any option or its alias is passed more than one times', async function () {
      const fixture = ['--config A -c R1', '-c A -i a --input d -i a', '-c A --output d -c a']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DUPLICATED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a non-existent file', async function () {
      const fixture = ['--config A -i no-file']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.NO_READ_ACCESS_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a directory', async function () {
      const fixture = ['--config A -i lib']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INPUT_IS_DIR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if output option lead to a non-existent file', async function () {
      const fixture = ['--config A -o no-file']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.NO_WRITE_ACCESS_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a directory', async function () {
      const fixture = ['--config A -o lib']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.OUTPUT_IS_DIR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option is started with dash', async function () {
      const fixture = ['--config "-A"', '-c "-C1"', '-c "--"', '-c "-"']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DASHED_CONF_START_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option is ended with dash', async function () {
      const fixture = ['--config "A-"', '-c "C1--"']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DASHED_CONF_END_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any command of the --config option has wrong length', async function () {
      const fixture = ['-c "C13"', '-c R0a']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.TOO_LONG_COMMAND_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has unknown cipher', async function () {
      const fixture = ['-c "W1"', '-c T0', '-c a']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNKNOWN_CIPHER_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has no direction for the C or R cipher', async function () {
      const fixture = ['-c "C"', '-c R', '-c A-R-A']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has a direction for the A cipher', async function () {
      const fixture = ['-c "A1"']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has a direction other than 0 or 1', async function () {
      const fixture = ['-c "C2"', '-c R3', '-c A-Rs-A']

      await testCli(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })
  })

  describe('input', function(){

    after(async () => {
      await fs.writeFile(inputPath, '')
      await fs.writeFile(outputPath, '')
    })

    it('Should read from the file if --input or -i option is passed', async function () {

      const strArr = ['abc', 'zyx']

      await fs.writeFile(inputPath, strArr[0])

      await testCli([`-c A -i ${inputPath}`], ({ subProcess, subout }) => {
        assert.strictEqual(subout, strArr[1])
        assert.strictEqual(subProcess.exitCode, 0)
      })

    })

    it('Should read from the stdin if the --input option is not passed', async function () {

      const execString = 'node lib/cli.js -c A'

      const handleSpawn = async ({ subProcess }) => {
        return new Promise(async (resolve, reject) => {

          subProcess.stdout.on('data', () => {
            subProcess.kill('SIGINT')
            resolve()
          })

          subProcess.stdin.write('asd')
          await timeout(1000)
          subProcess.kill('SIGTERM')
          throw new Error('handle spawn timeout')
        })
      }

      const handleClose = ({ subout }) => {
        assert.strictEqual(subout, 'zhw')
      }

      await spawnForTest({ execString, handleSpawn, handleClose})
    })

    it('Should allow to enter more than one line if reading from standard input', async function () {

      const execString = 'node lib/cli.js -c A'

      const toInput = ['a', 'b', 'c']

      const handleSpawn = async ({ subProcess }) => {
        return new Promise(async (resolve, reject) => {

          let counter = 0

          subProcess.stdout.on('data', (data) => {
            counter += 1
            if (counter === toInput.length) {
              subProcess.kill('SIGINT')
              resolve()
            }
          })

          for (let str of toInput) {
            subProcess.stdin.write(str)
            await timeout(ioDelay)
          }

          subProcess.kill('SIGTERM')
          reject(new Error('handle spawn timeout'))
        })
      }

      const handleClose = ({ subProcess, subout }) => {
        assert.strictEqual(subout, 'zyx')
      }

      await spawnForTest({ execString, handleSpawn, handleClose})
    })

    it('Should exit with code 0 if the application is stopped by SIGINT on reading from stdin', async function () {

      const input = ['a', 'b', 'c']
      const output = 'zyx'

      const execString = 'node lib/cli.js -c A'

      const handleSpawn = async ({ subProcess }) => {
        let counter = 0

        subProcess.stdout.on('data', (data) => counter += 1)

        for await (let chunk of input) {
          assert.isFalse(subProcess.killed)
          subProcess.stdin.write(chunk)
          await timeout(ioDelay)
        }

        subProcess.kill('SIGINT')
        assert.strictEqual(counter, 3)
      }

      const handleClose = ({ subout }) => {
        assert.strictEqual(subout, output)
      }

      await spawnForTest({ execString, handleSpawn, handleClose })
    })
  });

  describe('output', function () {

    after(async () => {
      await fs.writeFile(inputPath, '')
      await fs.writeFile(outputPath, '')
    })

    it('Should write to the file if --output or -o options is passed', async function () {

      const fixture = ['asd', 'zhw']

      await fs.writeFile(inputPath, fixture[0])
      await fs.writeFile(outputPath, '')

      const execString = `node lib/cli.js -c A -i ${inputPath} -o ${outputPath}`

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

      const execString = `node lib/cli.js -c A -i ${inputPath} -o ${outputPath}`

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

        execString: `node lib/cli.js -c A --output ${outputPath}`,

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

        execString: `node lib/cli.js -c A`,

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

        execString: `node lib/cli.js -c A -o ${outputPath}`,

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
    it('Should cipher only english alphabet symbols')
  })

  describe('examples', function () {

    after(async () => {
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

        execString: `node lib/cli.js ${options}`,

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

        execString: `node lib/cli.js ${options}`,

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

        execString: `node lib/cli.js ${options}`,

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

        execString: `node lib/cli.js ${options}`,

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