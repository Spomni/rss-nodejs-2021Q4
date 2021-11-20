const fs = require('fs')
const { Readable, Writable } = require('stream')

const { promisifyListener } = require('../lib/promisify-listener')
const { getIOFilesHelpers  } = require('../lib/test-file-helpers')
const { onFileChangeOnce } = require('../lib/on-file-change-promise')

const {
  inputPath,
  outputPath,
  clearIOFiles,
  removeIOFiles,
} = getIOFilesHelpers('cipher-io')

const { InputStream, OutputStream } = require('../../lib/cipher/cipher-io')

describe('cipher-io', function () {

  beforeEach(clearIOFiles)
  afterAll(removeIOFiles)

  describe('InputStream', function () {

    it('Should return a Readable stream instance', function (done) {
      const inputStream = new InputStream(inputPath)
      expect(inputStream).toBeInstanceOf(Readable)

      inputStream.on('resume', () => done())
      inputStream.resume()
    })

    it('Should read data from the passed file', async function () {

      const content = 'asd\nasdw'
      fs.writeFileSync(inputPath, content)

      const inputStream = new InputStream(inputPath)
      const ac = new AbortController()

      await promisifyListener(inputStream, 'data', (data) => {
        expect(data.toString()).toBe(content)
        ac.abort()
      }, ac.signal)
    })

    it('Should end if inputPath is not passed and process.std.pause() was called', function () {
      const inputStream = new InputStream()
      process.stdin.pause()
    })
  })

  describe('OutputStream', function () {

    it('Should return a Writable stream instance', function () {
      const outputStream = new OutputStream(outputPath)
      expect(outputStream).toBeInstanceOf(Writable)
      outputStream.end()
    })

    it('Should append data to the passed file', async function () {
      const existsData = 'asdawd\n'
      const toWriteData = 'asdasd asd aw'

      fs.writeFileSync(outputPath, existsData)

      const outputStream = new OutputStream(outputPath)

      const promise = onFileChangeOnce(outputPath, () => {
        const content = fs.readFileSync(outputPath)
        expect(content.toString()).toBe(existsData + toWriteData)
      })

      outputStream.end(toWriteData)

      await promise;
    })
  })
})
