const { cipher } = require('../../src/cipher')
const { timeout } = require('../__helpers/timeout-promise')

const jestExtended = require('jest-extended')
expect.extend(jestExtended)

jest.mock('stream/promises')
jest.mock('../../src/cipher/cipher-helpers')

const { pipeline } = require('stream/promises')

const {
  getTransformList,
  getInputStream,
  getOutputStream,
} = require('../../src/cipher/cipher-helpers')

const { ioDelay } = global.testEnv

const inputStream = {}
const outputStream = {}
const transformList = [{}, {}, {}]

getInputStream.mockReturnValue(inputStream)
getOutputStream.mockReturnValue(outputStream)
getTransformList.mockReturnValue(transformList)

pipeline.mockImplementation(async () => await timeout(20))

describe('cipher', () => {

  it('should return promise', async function () {
    expect(cipher()).toBeInstanceOf(Promise)
  })

  it('should get input stream by input option', function () {
    const input = {}

    cipher({ input })
    expect(getInputStream).toHaveBeenLastCalledWith(input)

    cipher()
    expect(getInputStream).toHaveBeenLastCalledWith(undefined)
  })

  it('should get output stream by output option', function () {
    const output = {}

    cipher({ output })
    expect(getOutputStream).toHaveBeenLastCalledWith(output)

    cipher()
    expect(getOutputStream).toHaveBeenLastCalledWith(undefined)
  })

  it('should get transforms by config option', function () {
    const config = {}

    cipher({ config })
    expect(getTransformList).toHaveBeenLastCalledWith(config)
  })

  it('should pipe input, output and transform streams using promised pipeline', function () {
    cipher()

    expect(pipeline)
      .toHaveBeenLastCalledWith(
        inputStream,
        ...transformList,
        outputStream
      )
  })

  it('should be resolved later than pipeline', async function () {
    let isPipelineFullfilled = false

    pipeline.mockImplementationOnce(async () => {
      await timeout(ioDelay)
      isPipelineFullfilled = true
    })

    await cipher()

    expect(isPipelineFullfilled).toBe(true)
  })
})
