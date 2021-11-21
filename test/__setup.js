const ioDelay = 200
const testTimeout = ioDelay * 5 * 5

jest.setTimeout(testTimeout)

global.testEnv = {
  ioDelay,
  testTimeout,
}
