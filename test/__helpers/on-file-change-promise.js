const fs = require('fs')

const { testTimeout } = global.testEnv

async function onFileChangeOnce(
  filename,
  callback,
  timeout = (testTimeout < 1000) ? 1000 : testTimeout - 1000,
) {
  return new Promise((resolve, reject) => {

    const watcher = fs.watch(filename)

    const timer = setTimeout(() => watcher.close(), timeout)

    watcher.on('close', rejectByTimeout)

    watcher.on('change', () => {
      clearTimeout(timer)
      watcher.off('close', rejectByTimeout)
      watcher.on('close', callListener)
      watcher.close()
    })

    function rejectByTimeout() {
      reject(new Error(`Exceeded timeout of ${timeout} ms for the onFileChangeOnce() function`))
    }

    function callListener() {
      try {
        callback()
        resolve()
      } catch (error) {
        reject(error)
      }
    }
  })
}

module.exports = {
  onFileChangeOnce,
}