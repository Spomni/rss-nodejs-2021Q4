const { pipeline } = require('stream')

const fs = require('fs')
const path = require('path')

const { throwIfInvalidConfig } = require('./helpers')
const { InputStream, OutputStream } = require('./cipher-io')

const {
  CipherError,
  InvalidConfigError,

  NoAccessToReadError,
  InputIsDirectoryError,

  NoAccessToWriteError,
  OutputIsDirectoryError,
} = require('./cipher-errors')

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

function isDirectory(filePath) {
  return fs.lstatSync(filePath).isDirectory()
}

function throwIfWrongInputFile(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
  } catch (err) {
    throw new NoAccessToReadError(err)
  }

  if (isDirectory(filePath)) {
    throw new InputIsDirectoryError(filePath)
  }
}

function throwIfWrongOutputFile(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.W_OK)
  } catch (err) {
    throw new NoAccessToWriteError(err)
  }

  if (isDirectory(filePath)) {
    throw new OutputIsDirectoryError(filePath)
  }
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

  const inputPath = (input) ? path.resolve(input) : null
  const outputPath = (output) ? path.resolve(output) : null

  if (inputPath) throwIfWrongInputFile(inputPath)
  if (outputPath) throwIfWrongOutputFile(outputPath)

  pipeline(
    new InputStream(inputPath),
    ...getTransformList(config),
    new OutputStream(outputPath),
    (err) => { throw err }
  )
}

module.exports = {
  cipher,
  CipherError,
  InvalidConfigError,
  NoAccessToReadError,
  InputIsDirectoryError,

  NoAccessToWriteError,
  OutputIsDirectoryError,
}
