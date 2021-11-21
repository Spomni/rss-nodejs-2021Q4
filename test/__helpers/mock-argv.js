const mockProps = require('jest-mock-props')
mockProps.extend(jest);

function mockArgv(argv, callback) {

  const value = [...process.argv.slice(0, 2), ...argv]

  const argvMock = jest.spyOn(process, 'argv').mockValue(value)

  callback()

  argvMock.mockRestore()
}

module.exports = {
  mockArgv,
}