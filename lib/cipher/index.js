const { pipeline } = require('stream')

const { throwIfInvalidConfig } = require('./helpers')

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

function cipher({
  config,
  input,
  output,
} = {}) {

  throwIfInvalidConfig(config)
  if (input) throwIfNoReadAccess(input)
  if (output) throwIfNoWriteAccess(output)

  pipeline(
    new InputStream(input),
    ...getTransformList(config),
    new OutputStream(output),
    (err) => { throw err }
  )
}

module.exports = {
  cipher
}
