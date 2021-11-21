const fs = require('fs/promises')

const { testTimeout, ioDelay } = global.testEnv

async function onFileChange(
  filename,
  timeout = (testTimeout < 2000) ? testTimeout : testTimeout - 1000,
) {
  return new Promise(async (resolve, reject) => {

    const oldBuffer = await fs.readFile(filename)
    let timer = null

    const rejectionTimer = setTimeout(() => {
      if (timer) clearTimeout(timer)
      reject(new Error('on file change timeout'))
    }, timeout)

    const iterate = async () => {

      const newBuffer = await fs.readFile(filename)

      if (newBuffer.toString() === oldBuffer.toString()) {
        timer = setTimeout(iterate, ioDelay)
      } else {
        clearTimeout(timer)
        clearTimeout(rejectionTimer)
        resolve()
      }
    }

    iterate()
  })
}

module.exports = {
  onFileChange,
}