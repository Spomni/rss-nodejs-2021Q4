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

  await pipeline(
    getInputStream(input),
    ...getTransformList(config),
    getOutputStream(output)
  )
}

module.exports = {
  cipher,
}
