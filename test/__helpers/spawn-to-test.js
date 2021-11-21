const { spawn } = require('child_process')

const { RejectionTimer } = require('./rejection-timer')

class TimeoutError extends Error {
  constructor(timeout) {
    super(`Exceeded timeout of ${timeout} ms for the spawnToTest() function`)
  }
}

function getRejectionTimer(timeout) {
  const reason = new TimeoutError(timeout)
  return new RejectionTimer(reason, timeout)
}

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

async function waitClosing({ subProcess }) {
  return new Promise((resolve) => {
    subProcess.on('close', () => resolve())
  })
}

const { testTimeout } = global.testEnv

async function spawnToTest({
  command = 'node',
  args = [],

  handleSpawn = null,
  handleClose = null,
  handleError = null,

  timeout = (testTimeout < 1000) ? 1000 : testTimeout - 1000,

  before = null,
  after = null
}) {

  if (before) await before()

  const subProcess = spawn(command, args)
  const timer = getRejectionTimer(timeout)

  try {
    await Promise.race([
      timer.start(),
      Promise.all([
        onErrorPromise({ subProcess, handleError }),
        onSpawnPromise({ subProcess, handleSpawn }),
        onClosePromise({ subProcess, handleClose }),
        waitClosing({ subProcess }),
      ])
    ])

  } finally {

    timer.clear()
    subProcess.kill()

    if (after) await after()
  }
}

async function spawnSeriesToTest(configArray) {
  for (let config of configArray) {
    await spawnToTest(config)
  }
}

async function spawnParallelToTest(configArray) {
  return Promise.all(
    configArray.map((config) => spawnToTest(config))
  )
}

function seriesByArgs(config) {
  const { argsSeries, ...configRest } = config
  return argsSeries.map(
    (args) => Object.assign({}, configRest, { args })
  )
}

module.exports = {
  spawnToTest,
  spawnSeriesToTest,
  spawnParallelToTest,
  seriesByArgs,
}