const path = require(`path`)

const jestExtended = require('jest-extended')
expect.extend(jestExtended)

const srcPath = path.resolve(__dirname, '../../lib/')
const testPath = path.resolve(__dirname, '../')

function fromSrc(filename) {
  return path.join(srcPath, filename)
}

jest.mock(fromSrc(`cipher/cipher-io`))
jest.mock(fromSrc('transform'))

const {
  InputStream,
  OutputStream,
} = require(fromSrc('cipher/cipher-io'))

const {
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
} = require(fromSrc('transform'))

const {
  getTransformList,
  getInputStream,
  getOutputStream,
} = require(fromSrc('cipher/cipher-helpers'))

describe('cipher-helpers', () => {

  describe('getInputStream():', function () {

    it('Should retun process.stdin if the input option is not passed', function () {
      expect(getInputStream()).toBe(process.stdin)
    })

    it('Should return an instance of the InputSteam class if the input option is passed', function () {
      expect(getInputStream('some/path')).toBeInstanceOf(InputStream)
    })
  })

  describe('getOutputStream():', function () {

    it('Should retun process.stdout if the output option is not passed', function () {
      expect(getOutputStream()).toBe(process.stdout)
    })

    it('Should return an instance of the OutputSteam classif the output option is passed', function () {
      expect(getOutputStream('some/path')).toBeInstanceOf(OutputStream)
    })
  })

  describe('getTransformList():', function () {

    it('Should return an array', function () {
      expect(getTransformList('A-C0-R0')).toBeArray()
    })

    it('Should place an AtbashTransformer instance at the same position where acommand "A" is', function () {
      const config = 'R1-A-C1-A'
      const transformList = getTransformList(config)

      config.split('-').forEach((command, index) => {
        if (command !== 'A') return

        expect(transformList[index]).toBeInstanceOf(AtbashTransformer)
      })
    })

    it('Should place an CaesarEncoder instance at the same position where a command "C1" is', function () {
      const config = 'R1-A-C1-A-R0-C1-C0'
      const transformList = getTransformList(config)

      config.split('-').forEach((command, index) => {
        if (command !== 'C1') return

        expect(transformList[index]).toBeInstanceOf(CaesarEncoder)
      })
    })

    it('Should place an CaesarDecoder instance at the same position where a command "C0" is', function () {
      const config = 'C0-A-C1-A-R0-C1-C0'
      const transformList = getTransformList(config)

      config.split('-').forEach((command, index) => {
        if (command !== 'C0') return

        expect(transformList[index]).toBeInstanceOf(CaesarDecoder)
      })
    })

    it('Should place an Rot8Encoder instance at the same position where a command "R1" is', function () {
      const config = 'R1-A-C1-R1-R0-C1-C0'
      const transformList = getTransformList(config)

      config.split('-').forEach((command, index) => {
        if (command !== 'R1') return

        expect(transformList[index]).toBeInstanceOf(Rot8Encoder)
      })
    })

    it('Should place an Rot8Decoder instance at the same position where a command "R0" is', function () {
      const config = 'R1-A-C1-R0-R0-C1-C0'
      const transformList = getTransformList(config)

      config.split('-').forEach((command, index) => {
        if (command !== 'R0') return

        expect(transformList[index]).toBeInstanceOf(Rot8Decoder)
      })
    })
  })
})