const { pipeline } = require('stream/promises')
const path = require('path')

const { InputStream, OutputStream } = require('./cipher-io')

const {
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
} = require('../transform')

const transformConsructorMap = {
  'C1': CaesarEncoder,
  'C0': CaesarDecoder,
  'R1': Rot8Encoder,
  'R0': Rot8Decoder,
  'A': AtbashTransformer,
}

function getTransform(cmd) {
  return new transformConsructorMap[cmd]()
}

function getTransformList(config) {
  return config.split('-').map((cmd) => getTransform(cmd))
}

async function cipher({
  config,
  input,
  output,
} = {}) {

  const inputPath = (input) ? path.resolve(input) : null
  const outputPath = (output) ? path.resolve(output) : null

  await pipeline(
    new InputStream(inputPath),
    ...getTransformList(config),
    new OutputStream(outputPath)
  )
}

module.exports = {
  cipher,
}