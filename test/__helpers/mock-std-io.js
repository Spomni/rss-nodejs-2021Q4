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

    await callback(output, stderr)

  } finally {
    Object.defineProperty(process, 'stderr', {
      writable: true,
      enumarable: true,
      value: stderr
    })
  }
}

module.exports = {
  mockStderr,
}
