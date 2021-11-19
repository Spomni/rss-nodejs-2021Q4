const {
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
} = require('../transform')

const { InputStream, OutputStream } = require('./cipher-io')

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

function getInputStream(input) {
  return (input)
    ? new InputStream(input)
    : process.stdin
}

function getOutputStream(output) {
  return (output)
    ? new OutputStream(output)
    : process.stdout
}

module.exports = {
  getTransformList,
  getInputStream,
  getOutputStream,
}
