const { spawn } = require('child_process')
const { Buffer } = require('buffer')
const { assert } = require('chai')

const ERR_REG_EXP_ = {

  FIRST_ARG_ERR: /FirstArgumentError: application can not be called without options\n/,
  INVALID_OPT_ERR: /InvalidOptionsError: invalid option ".+" was found\n/,
  UNKNOWN_OPT_ERR: /UnknownOptionsNameError: unknown option ".+" was found\n/,
  FLAG_VALUE_ERR: /FlagOptionValueError: the ".+" option is a flag and can not have any value\n/,
  UNEXPECTED_VAL_ARR_ERR: /UnexpectedValuesArrayError: the option ".+" must be assigned with one value only\n/,
  MISS_REQUIRED_OPT_ERR: /MissedRequiredOptionError: the option ".+" must not be missed\n/,
  MISS_OPT_VAL_ERR: /MissedOptionValueError: the option ".+" must has a value\n/,
  DUPLICATED_OPT_ERR: /DuplicatedOptionError: the option ".+" can not be duplicatied\n/,
  NO_READ_ACCESS_ERR: /NoAccessToReadError: file ".+" can not be readed: check if it exists and you have access to read\n/,
  INPUT_IS_DIR_ERR: /InputIsDirectoryError: passed input file ".+" is a directory\n/,
  NO_WRITE_ACCESS_ERR: /NoAccessToWriteError: file ".+" can not be written: check if it exists and you have access to write\n/,
  OUTPUT_IS_DIR_ERR: /OutputIsDirectoryError: passed output file ".+" is a directory\n/,

  DASHED_CONF_START_ERR: /DashAtConfigStartError: value of the option "--config" must not start with a dash symbol\n/,
  DASHED_CONF_END_ERR: /DashAtConfigEndError: value of the option "--config" must not be ended with a dash symbol\n/,
  TOO_LONG_COMMAND_ERR: /InvalidCommandLengthError: too long command ".+" was found on the config command with number \d+.\n\tThe ciphering command should have only two symbol for the Caesar and ROT-8 ciphers and only one symbol for the cipher Atbash\n/,
  UNKNOWN_CIPHER_ERR: /UnknownCipherError: unknown cipher type was found on the config command ".+" with number \d+. \n\tA command should start with the letter that represents a cipher type. \n\tPossible cipher types:\n\t\tC - Caesar\n\t\tR - ROT-8\n\t\tA - Atbash\n/,
  INVALID_DIRECTION_ERR: /InvalidCipheringDirectionError: unknown ciphering direction was found on the config command ".+" with number \d+.\n\tThe second symbol of the chained command must be a correct ciphering direction: 1 - encoding, 0 - decoding.\n\tThe Atbash cipher command \(A\) should not have any ciphering direction symbol\n/,
}

async function testCliError(fixture, callback) {
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

describe.only('cli', function () {

  describe('Should print to the stderr human friendly errors and should exit with non-zero code:', function () {

    it('if no option is passed', async function () {
      const fixture = ['']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FIRST_ARG_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if invalid option name is passed', async function () {
      const fixture = ['-config', '--i']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any unknown option is passed', async function () {
      const fixture = ['--conf', '--price']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNKNOWN_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any value passed to the --debug option', async function () {
      const fixture = ['--debug true']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FLAG_VALUE_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if more than one value passed to to option --config, --input, --output or their aliases', async function () {
      const fixture = ['--config a b', '-c s d', '--input a b', '-i a s', '--output a a', '-o a s w d']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNEXPECTED_VAL_ARR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the option --config is missed', async function () {
      const fixture = ['--input input.txt']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_REQUIRED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if no value is passed to option --config, --input or --output', async function () {
      const fixture = ['--config', '-c A -i', '-c A --output']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_OPT_VAL_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any option or its alias is passed more than one times', async function () {
      const fixture = ['--config A -c R1', '-c A -i a --input d -i a', '-c A --output d -c a']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DUPLICATED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a non-existent file', async function () {
      const fixture = ['--config A -i no-file']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.NO_READ_ACCESS_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a directory', async function () {
      const fixture = ['--config A -i lib']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INPUT_IS_DIR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if output option lead to a non-existent file', async function () {
      const fixture = ['--config A -o no-file']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.NO_WRITE_ACCESS_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a directory', async function () {
      const fixture = ['--config A -o lib']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.OUTPUT_IS_DIR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option is started with dash', async function () {
      const fixture = ['--config "-A"', '-c "-C1"', '-c "--"', '-c "-"']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DASHED_CONF_START_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option is ended with dash', async function () {
      const fixture = ['--config "A-"', '-c "C1--"']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DASHED_CONF_END_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any command of the --config option has wrong length', async function () {
      const fixture = ['-c "C13"', '-c R0a']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.TOO_LONG_COMMAND_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has unknown cipher', async function () {
      const fixture = ['-c "W1"', '-c T0', '-c a']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNKNOWN_CIPHER_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has no direction for the C or R cipher', async function () {
      const fixture = ['-c "C"', '-c R', '-c A-R-A']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has a direction for the A cipher', async function () {
      const fixture = ['-c "A1"']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the --config option has a direction other than 0 or 1', async function () {
      const fixture = ['-c "C2"', '-c R3', '-c A-Rs-A']

      await testCliError(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_DIRECTION_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })
  })

  describe('input', function(){
    it('Should read from the file if --input or -i option is passed')
    it('Should read from the stdin if the --input option is not passed')
    it('Should allow to enter more than one line if reading from standard input')
    it('Should exit with code 0 if the application is stopped by SIGINT on reading from stdin')
  });

  describe('output', function () {
    it('Should write to the file if --output or -o options is passed')
    it('Should not overwrite existing file content')
    it('Should write to the stdout if the --output option is not passed')
  })

  describe('ciphering', function () {
    it('Should cipher only english alphabet symbols')
  })

  describe('examples', function () {
    it('c "C1-C1-R0-A" -i "./input.txt" -o "./output.txt"')
    it('-c "C1-C0-A-R1-R0-A-R0-R0-C1-A" -i "./input.txt" -o "./output.txt"')
    it('-c "A-A-A-R1-R0-R0-R0-C1-C1-A" -i "./input.txt" -o "./output.txt"')
    it('-c "C1-R1-C0-C0-A-R0-R1-R1-A-C1" -i "./input.txt" -o "./output.txt"')
  })
})