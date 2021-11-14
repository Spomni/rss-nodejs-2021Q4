const { Readable, Writable } = require('stream')
const fs = require('fs')

class InputStream extends Readable {

  constructor(input) {
    super()

    this._source = (input)
      ? fs.createReadStream(input)
      : process.stdin

    this._addSourceListeners()

    if (this._source === process.stdin) {
      process.once('SIGINT', () => {
        process.stdin.pause()
      })
    }

    this._source.resume()
  }

  _read() {}

  _addSourceListeners() {
    this._source.on('data', this._handleSourceData)
    this._source.on('pause', this._handleSourcePause)
  }

  _removeSourceListeners() {
    this._source.off('data', this._handleSourceData)
    this._source.off('pause', this._handleSourcePause)
  }

  _handleSourceData = (data) => {
    this.push(data)
  }

  _handleSourcePause = () => {
    this._removeSourceListeners()
    this.push(null)
  }

  _destroy() {
    this._removeSourceListeners()
  }
}

class OutputStream extends Writable {

  constructor(output) {
    super()

    this._target = (output)
      ? fs.createWriteStream(output, { flags: 'a' })
      : process.stdout
  }

  _write(data, _, done) {
    this._target.write(data)
    done()
  }
}

module.exports = {
  InputStream,
  OutputStream,
}