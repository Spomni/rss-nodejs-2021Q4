const ioDelay = 50
const testTimeout = (ioDelay < 200) ? 5000 : ioDelay * 25

jest.setTimeout(testTimeout)

global.testEnv = {
  ioDelay,
  testTimeout,
}
