const fs = require('fs/promises')

async function onFileChange(filename, timeout) {
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
        timer = setTimeout(iterate, 100)
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