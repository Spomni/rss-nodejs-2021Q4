const fs = require('fs/promises')

const {
  spawnToTest,
  spawnParallelToTest,
  seriesByArgs,
} = require('./lib/spawn-to-test')

const { timeout } = require('./lib/timeout-promise')

const ERR_REG_EXP_ = require('./lib/cli-errors-reg-exp')

const cliPath = 'index'
const inputPath = 'test/fixture/cli-input'
const outputPath = 'test/fixture/cli-output'

const ioDelay = 200

async function clearIOFiles() {
  await fs.writeFile(inputPath, '')
  await fs.writeFile(outputPath, '')
}

async function removeIOFiles() {
  await fs.unlink(inputPath)
  await fs.unlink(outputPath)
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
      
        timeout: ioDelay * 2 * 3,

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
        [`${cliPath} -c C1 -i ${inputPath} -o ${outputPath}`, 'O', 'P'],
        [`${cliPath} -c C1 -i ${inputPath} --output ${outputPath}`, '!!!', '!!!'],
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
        
        args: `${cliPath} -c A -i ${inputPath} -o ${outputPath}`.split(' '),
        
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

        args: `${cliPath} -c R1 -i ${inputPath}`.split(' '),

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
        
        args: `${cliPath} -c A`.split(' '),
        
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

      let counter = 0

      await spawnToTest({
      
        timeout: ioDelay * input.length * 4,
      
        args: `${cliPath} -c A -o ${outputPath}`.split(' '),
        
        async handleSpawn({ subProcess }) {
          let index = 0
          
          for (let letter of input) {

            subProcess.stdin.write(letter)
            
            await timeout(ioDelay * 3)
            
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
        
        args: `${cliPath} -c R1-C0-A`.split(' '),
        
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
    
    it('Should works correct with task examples', async function () {

      const input = `This is secret. Message about "_" symbol!`

      const getArgs = (config) => `${cliPath} -c ${config} -i "${inputPath}" -o "${outputPath}"`.split(' ')

      const fixtures = [
        {
          config: `"C1-C1-R0-A"`,
          output: `Myxn xn nbdobm. Tbnnfzb ferlm "_" nhteru!`,
        },
        {
          config: `"C1-C0-A-R1-R0-A-R0-R0-C1-A"`,
          output: `Vhgw gw wkmxkv. Ckwwoik onauv "_" wqcnad!`
        },
        {
          config: `"A-A-A-R1-R0-R0-R0-C1-C1-A"`,
          output: `Hvwg wg gsqfsh. Asggous opcih "_" gmapcz!`,
        },
        {
          config: `"C1-R1-C0-C0-A-R0-R1-R1-A-C1"`,
          output: `This is secret. Message about "_" symbol!`
        },
      ]
      
      await fs.writeFile(inputPath, input)
      
      for (let { config, output } of fixtures) {
        await spawnToTest({
          
          args: getArgs(config),
          
          async handleClose({ code }) {
            expect(code).toBe(0)
            
            const content = await fs.readFile(outputPath, 'utf-8')
            expect(content).toBe(output)
          },
          
          async after() {
            await fs.writeFile(outputPath, '')
          }
        })
      }
    })
  })
})