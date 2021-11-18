const path = require('path')
const { pipeline } = require('stream/promises')

const {
  getTransformList,
  getInputStream,
  getOutputStream,
} = require('./cipher-helpers')

async function cipher({
  config,
  input,
  output,
} = {}) {

  const inputPath = (input) ? path.resolve(input) : null
  const outputPath = (output) ? path.resolve(output) : null

  await pipeline(
    getInputStream(inputPath),
    ...getTransformList(config),
    getOutputStream(outputPath)
  )
}

module.exports = {
  cipher,
}
