const { PassThrough } = require('stream')

async function mockStderr(callback) {

  const { stderr } = process

  try {
    const output = new PassThrough()

    Object.defineProperty(process, 'stderr', {
      writable: true,
      enumarable: true,
      value: output
    })

    await callback(stderr)

  } finally {
    Object.defineProperty(process, 'stderr', {
      writable: true,
      enumarable: true,
      value: stderr
    })
  }
}

async function mockStdout(callback) {

  const { stdout } = process

  try {
    const output = new PassThrough()

    Object.defineProperty(process, 'stdout', {
      writable: true,
      enumarable: true,
      value: output
    })

    await callback(stdout)

  } finally {
    Object.defineProperty(process, 'stdout', {
      writable: true,
      enumarable: true,
      value: stdout
    })
  }
}

module.exports = {
  mockStdout,
  mockStderr,
}
