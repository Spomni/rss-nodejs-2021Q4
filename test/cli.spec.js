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
}

async function testFixtureArray(fixture, callback) {
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

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FIRST_ARG_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if invalid option name is passed', async function () {
      const fixture = ['-config', '--i']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.INVALID_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any unknown option is passed', async function () {
      const fixture = ['--conf', '--price']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNKNOWN_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if any value passed to the --debug option', async function () {
      const fixture = ['--debug true']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.FLAG_VALUE_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if more than one value passed to to option --config, --input, --output or their aliases', async function () {
      const fixture = ['--config a b', '-c s d', '--input a b', '-i a s', '--output a a', '-o a s w d']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.UNEXPECTED_VAL_ARR_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if the option --config is missed', async function () {
      const fixture = ['--input input.txt']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_REQUIRED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if no value is passed to option --config, --input or --output', async function () {
      const fixture = ['--config', '-c A -i', '-c A --output']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.MISS_OPT_VAL_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })
    it('if any option or its alias is passed more than one times', async function () {
      const fixture = ['--config A -c R1', '-c A -i a --input d -i a', '-c A --output d -c a']

      await testFixtureArray(fixture, ({ subProcess, suberr }) => {
        assert.match(suberr, ERR_REG_EXP_.DUPLICATED_OPT_ERR)
        assert.isAbove(subProcess.exitCode, 0)
      })
    })

    it('if input option lead to a non-existent file')
    it('if input option lead to a directory')
    it('if output option lead to a non-existent file')
    it('if input option lead to a directory')

    it('if the --config option is started with dash')
    it('if the --config option is ended with dash')
    it('if any command of the --config option has wrong length')

    it('if the --config option has unknown cipher')
    it('if the --config option has no direction for the C or R cipher')
    it('if the --config option has a direction for the A cipher')
    it('if the --config option has a direction other than 0 or 1')
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