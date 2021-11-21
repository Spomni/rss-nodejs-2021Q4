const mockProps = require('jest-mock-props')
mockProps.extend(jest);

const fs = require('fs/promises')
const path = require('path')

const {
  spawnToTest,
  spawnParallelToTest,
  seriesByArgs,
} = require('./__helpers/spawn-to-test')

const { timeout } = require('./__helpers/timeout-promise')

const ERR_REG_EXP_ = require('./__helpers/cli-errors-reg-exp')

const {
  srcPath,
  testPath,
  getIOFilesHelpers,
} = require('./__helpers/test-file-helpers')

const {
  inputPath,
  outputPath,
  clearIOFiles,
  removeIOFiles,
} = getIOFilesHelpers('ciphering-cli-tool')

const ArgvParserModule = require('../src/argv-parser')
const { ArgvParser } = ArgvParserModule

const parserMock = jest.spyOn(ArgvParserModule, 'parser')

const { onFileChange } = require('./__helpers/on-file-change')
const { mockArgv } = require('./__helpers/mock-argv')
const { mockStderr } = require('./__helpers/mock-std-io')

const appPath = path.resolve(srcPath, '../index.js')

const { ioDelay } = global.testEnv

describe('ciphering-cli-tool', function () {

  beforeEach(async () => await clearIOFiles())
  afterAll(async () => await removeIOFiles())

  describe('Should print to the stderr human friendly errors and should exit with non-zero code:', function () {

    it('if no option is passed', async function () {
      await spawnToTest({

        args: [`${appPath}`],

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.FIRST_ARG_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if invalid option name is passed', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${appPath} -config`,
          `${appPath} --i`,
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
          `${appPath} -c A --conf`,
          `${appPath} -c R1 --price`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.UNKNOWN_OPT_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if any value passed to the --debug option', async function () {
      await spawnToTest({

        args: `${appPath} -c C0 --debug true`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.FLAG_VALUE_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if more than one value passed to to option --config, --input, --output or their aliases', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${appPath} --config a b`,
          `${appPath} -c s d`,
          `${appPath} --input a b`,
          `${appPath} -i a s`,
          `${appPath} --output a a`,
          `${appPath} -o a s w d`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.UNEXPECTED_VAL_ARR_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the option --config is missed', async function () {
      await spawnToTest({

        args: `${appPath} --input input.txt`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.MISS_REQUIRED_OPT_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if no value is passed to option --config, --input or --output', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${appPath} --config`,
          `${appPath} -c A -i`,
          `${appPath} -c A --output`,
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
          `${appPath} --config A -c R1`,
          `${appPath} -c A -i a --input d -i a`,
          `${appPath} -c A --output d -c a`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.DUPLICATED_OPT_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if input option lead to a non-existent file', async function () {
      await spawnToTest({

        args: `${appPath} --config A -i no-file`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.NO_READ_ACCESS_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if input option lead to a directory', async function () {
      await spawnToTest({

        args: `${appPath} --config A -i ${testPath}`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INPUT_IS_DIR_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if output option lead to a non-existent file', async function () {
      await spawnToTest({

        args: `${appPath} --config A -o no-file`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.NO_WRITE_ACCESS_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if input option lead to a directory', async function () {
      await spawnToTest({

        args: `${appPath} --config A -o ${testPath}`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.OUTPUT_IS_DIR_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if the --config option is started with dash', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${appPath} --config "-A"`,
          `${appPath} -c "-C1"`,
          `${appPath} -c "--"`,
          `${appPath} -c "-"`,
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
          `${appPath} --config "A-"`,
          `${appPath} -c "C1--"`,
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
          `${appPath} -c "C13"`,
          `${appPath} -c R0a`,
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
          `${appPath} -c "W1"`,
          `${appPath} -c T0`,
          `${appPath} -c a`,
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
          `${appPath} -c "C"`,
          `${appPath} -c R`,
          `${appPath} -c A-R-A`,
        ].map((str) => str.split(' ')),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_DIRECTION_ERR)
          expect(code).not.toBe(0)
        }
      }))
    })

    it('if the --config option has a direction for the A cipher', async function () {
      await spawnToTest({

        args: `${appPath} -c A1`.split(' '),

        handleClose({ suberr, code }) {
          expect(suberr).toMatch(ERR_REG_EXP_.INVALID_DIRECTION_ERR)
          expect(code).not.toBe(0)
        }
      })
    })

    it('if the --config option has a direction other than 0 or 1', async function () {
      await spawnParallelToTest(seriesByArgs({

        argsSeries: [
          `${appPath} -c "C2"`,
          `${appPath} -c R3`,
          `${appPath} -c A-Rs-A`,
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

        args: `${appPath} -c A -i ${inputPath}`.split(' '),

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

        args: `${appPath} -c C1`.split(' '),

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

        args: `${appPath} -c C0`.split(' '),

        async handleSpawn({ subProcess }) {
          for (let input of fixtures) {
            subProcess.stdin.write(input)
            await timeout(ioDelay)
          }

          subProcess.exitCode = 0
          subProcess.kill()
        },

        handleClose({ subout, code }) {
          expect(code).toBe(0)
          expect(subout).toHaveLength(3)
        },
      })
    })
  });

  describe('output', function () {

    beforeEach(async () => await clearIOFiles())

    it('Should write to the file if --output or -o options is passed', async function () {

      const fixtures = [
        [`${appPath} -c C1 -i ${inputPath} -o ${outputPath}`, 'O', 'P'],
        [`${appPath} -c C1 -i ${inputPath} --output ${outputPath}`, '!!!', '!!!'],
      ]

      for (let [argsStr, input, output] of fixtures) {
        await spawnToTest({

          args: argsStr.split(' '),

          async before() {
            await fs.writeFile(inputPath, input)
          },

          async handleClose({ code }) {
            expect(code).toBe(0)

            const content = await fs.readFile(outputPath, 'utf-8')
            expect(content).toBe(output)
          },

          async after() {
            await clearIOFiles()
          },
        })
      }
    })

    it('Should not overwrite existing file content', async function () {

      const existsOutput = 'abc'
      const input = 'asd'
      const output = 'zhw'
      const finalOutput = existsOutput + output

      await spawnToTest({

        args: `${appPath} -c A -i ${inputPath} -o ${outputPath}`.split(' '),

        async before() {
          await fs.writeFile(inputPath, input)
          await fs.writeFile(outputPath, existsOutput)
        },

        async handleClose({ code }) {
          expect(code).toBe(0)

          const content = await fs.readFile(outputPath, 'utf-8')
          expect(content).toBe(finalOutput)
        },
      })
    })

    it('Should write to the stdout if the --output option is not passed', async function () {

      const input = 'pump track'
      const output = 'xcux bziks'

      await spawnToTest({

        args: `${appPath} -c R1 -i ${inputPath}`.split(' '),

        async before() {
          await fs.writeFile(inputPath, input)
        },

        handleClose({ code, subout }) {
          expect(code).toBe(0)
          expect(subout).toBe(output)
        }
      })
    })

    it('Should write to stdout every times when stdin is pushed', async function () {

      const input = 'abc'
      const output = 'zyx'

      let counter = 0

      await spawnToTest({

        args: `${appPath} -c A`.split(' '),

        handleSpawn({ subProcess }) {

          subProcess.stdout.on('data', () => {
            counter += 1

            if (counter !== input.length) {
              subProcess.stdin.write(input[counter])
            } else {
              subProcess.exitCode = 0
              subProcess.kill()
            }
          })

          subProcess.stdin.write(input[0])
        },

        handleClose({ code, subout }) {
          expect(code).toBe(0)
          expect(counter).toBe(input.length)
          expect(subout).toBe(output)
        }
      })
    })

    it('Should write to the file every times when stdin is pushed', async function () {

      const input = 'abc'
      const output = 'zyx'

      await spawnToTest({

        args: `${appPath} -c A -o ${outputPath}`.split(' '),

        async handleSpawn({ subProcess }) {
          let index = 0

          for (let letter of input) {

            const promise = onFileChange(outputPath)
            await timeout(ioDelay)
            subProcess.stdin.write(letter)
            await promise

            const expectedContent = output.slice(0, index + 1)
            const content = await fs.readFile(outputPath, 'utf-8')

            expect(content).toBe(expectedContent)

            index += 1
          }

          subProcess.exitCode = 0
          subProcess.kill()
        },

        handleClose({ code }) {
          expect(code).toBe(0)
        }
      })
    })
  })

  describe('ciphering', function () {

    it('Should cipher only english alphabet symbols', async function () {

      const input = `
        adfgutvnjihfd hujhfy
        _/*[](){}<^°¢£~√×}[<©®™
        паыкгщоппнзжпмипкврщщпм
        13796322797587535
      `
      const output = `
        spnmyzxfjklnp lyjlnu
        _/*[](){}<^°¢£~√×}[<©®™
        паыкгщоппнзжпмипкврщщпм
        13796322797587535
      `

      await spawnToTest({

        args: `${appPath} -c R1-C0-A`.split(' '),

        handleSpawn({ subProcess }) {

          subProcess.stdout.on('data', () => {
            subProcess.exitCode = 0
            subProcess.kill()
          })

          subProcess.stdin.write(input)
        },

        handleClose({ code, subout }) {
          expect(code).toBe(0)
          expect(subout).toBe(output)
        }
      })
    })
  })

  describe('examples', function () {

    beforeEach(async () => await clearIOFiles())

    it.each([
      [
        '$ node my_ciphering_cli -c "C1-C1-R0-A" -i "./input.txt" -o "./output.txt"',
        "C1-C1-R0-A",
        `Myxn xn nbdobm. Tbnnfzb ferlm "_" nhteru!`,
      ],
      [
        '$ node my_ciphering_cli -c "C1-C0-A-R1-R0-A-R0-R0-C1-A" -i "./input.txt" -o "./output.txt"',
        "C1-C0-A-R1-R0-A-R0-R0-C1-A",
        `Vhgw gw wkmxkv. Ckwwoik onauv "_" wqcnad!`,
      ],
      [
        '$ node my_ciphering_cli -c "A-A-A-R1-R0-R0-R0-C1-C1-A" -i "./input.txt" -o "./output.txt"',
        '"A-A-A-R1-R0-R0-R0-C1-C1-A"',
        'Hvwg wg gsqfsh. Asggous opcih "_" gmapcz!'
      ],
      [
        '$ node my_ciphering_cli -c "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -i "./input.txt" -o "./output.txt"',
        '"C1-R1-C0-C0-A-R0-R1-R1-A-C1"',
        'This is secret. Message about "_" symbol!'
      ]
    ])('%s', async function (name, config, output) {

      const input = `This is secret. Message about "_" symbol!`

      await fs.writeFile(inputPath, input)

      await spawnToTest({

        args: [
          appPath,
          ...`-c ${config}`.split(' '),
          ...`-i "${inputPath}"`.split(' '),
          ...`-o "${outputPath}"`.split(' '),
          '--debug'
        ],

        async handleClose({ code }) {

          expect(code).toBe(0)

          const content = await fs.readFile(outputPath, 'utf-8')
          expect(content).toBe(output)
        },

        async after() {
          await fs.writeFile(outputPath, '')
        }
      })
    })

    it('Should print human readable error if no file access to read', function (done) {

      const fs = require('fs')

      jest
        .spyOn(fs, 'accessSync')
        .mockImplementation((file, constant) => {
          if (constant === fs.constants.R_OK) {
            throw new ('no access to read')
          }
        })

      jest
        .spyOn(process, 'exit')
        .mockImplementation((code) => {})


      const { cli } = require('../src/cli/cli')

      mockArgv(`-c A -i no-file`.split(' '), async () => {
        mockStderr((stdErrMock) => {

          stdErrMock.on('data', (data) => {
            const message = data.toString()

            try {
              expect(message).toMatch(ERR_REG_EXP_.NO_READ_ACCESS_ERR)
              done()
            } catch (error) {
              done(error)
            }
          })

          cli()

          fs.accessSync.mockRestore()
          process.exit.mockRestore()
        })
      })
    })

    it('Should print human readable error if no file access to read', function (done) {

      const fs = require('fs')

      jest
        .spyOn(fs, 'accessSync')
        .mockImplementation((file, constant) => {
          if (constant === fs.constants.W_OK) {
            throw new ('no access to read')
          }
        })

      jest
        .spyOn(process, 'exit')
        .mockImplementation(() => {})

      parserMock.mockValueOnce(new ArgvParser())
      const { cli } = require('../src/cli/cli')

      mockArgv(`-c A -i ${inputPath} -o no-file`.split(' '), async () => {
        mockStderr((stdErrMock) => {

          stdErrMock.on('data', (data) => {
            const message = data.toString()

            try {
              expect(message).toMatch(ERR_REG_EXP_.NO_WRITE_ACCESS_ERR)
              done()
            } catch (error) {
              done(error)
            }
          })

          cli()

          fs.accessSync.mockRestore()
          process.exit.mockRestore()
        })
      })
    })
  })
})
