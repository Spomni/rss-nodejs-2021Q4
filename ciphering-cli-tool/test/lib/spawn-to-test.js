const { spawn } = require('child_process')

async function onErrorPromise({ subProcess, handleError }) {

  if (!handleError) return Promise.resolve()

  return new Promise((resolve, reject) => {

    subProcess.on('close', () => resolve())
    
    subProcess.on('error', async (error) => {
      try {
        await handleError({ subProcess, error })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function onSpawnPromise({ subProcess, handleSpawn }) {

  if (!handleSpawn) return Promise.resolve()

  return new Promise((resolve, reject) => {
    subProcess.on('spawn', async () => {
      try {
        await handleSpawn({ subProcess })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function onClosePromise({ subProcess, handleClose }) {

  if (!handleClose) return Promise.resolve()

  let subout = ''
  let suberr = ''
  
  subProcess.stdout.on('data', (data) => subout += data.toString())
  subProcess.stderr.on('data', (data) => suberr += data.toString())

  return new Promise((resolve, reject) => {
    subProcess.on('close', async (code, signal) => {
      try {
        await handleClose({ subProcess, code, signal, subout, suberr })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function rejectAfterDelay(error, delay, cancel) {
  return new Promise((r, reject) => {
    setTimeout(() => reject(error), delay)
  })
}

class TimeoutError extends Error {
  constructor(timeout) {
    super(`Exceeded timeout of ${timeout} ms for the spawnToTest() function`)
  }
}

class RejectionTimer {

  constructor(reason, timeout) {
    Object.assign(this, {
      reason,
      timeout
    })
  }
  
  start() {
    return new Promise((resolve, reject) => {
      const descriptor = setTimeout(() => reject(this.reason), this.timeout)

      this.resolve = (value) => {
        clearTimeout(descriptor)
        resolve(value)
        return this
      }
    })
  }

  resolve(value) {
    return Promise.resolve(value)
  }
}

async function spawnToTest({
  command,
  args = [],
  handleSpawn = null,
  handleClose = null,
  handleError = null,
  timeout = 1000,
}) {

  const subProcess = spawn(command, args)
  const timer = new RejectionTimer(new TimeoutError(timeout), timeout)

  try {
    await Promise.race([
      timer.start(),
      Promise.all([
        onErrorPromise({ subProcess, handleError }),
        onSpawnPromise({ subProcess, handleSpawn }),
        onClosePromise({ subProcess, handleClose }),
      ])
    ])
  } finally {
    timer.resolve()
    subProcess.kill()
  }
}

async function spawnNodeToTest({ ...opts }) {
  return spawnToTest(
    Object.assign(opts, {
      command: 'node' 
    })
  )
}

async function spawnSeriesToTest({
  argsSeries,
  allowRace = false,
  ...opts
}) {

  if (allowRace) {
    return Promise.all(
      argsSeries.map((args) => spawnToTest(
        Object.assign({}, opts, args)
      ))
    )
  }

  return new Promise(async (resolve, reject) => {
    try {
      for (let args of argsSeries) {
        await spawnToTest(Object.assign({}, opts, args))
      }

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  spawnToTest,
  spawnNodeToTest,
}
