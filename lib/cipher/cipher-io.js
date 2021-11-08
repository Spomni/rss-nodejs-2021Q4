const { PassThrough } = require('stream')
const fs = require('fs')

class InputStream extends PassThrough {
  constructor(input) {
    super()
    const source = (input)
      ? fs.createReadStream(input)
      : process.stdin

    return source.pipe(this)
  }
}

class OutputStream extends PassThrough {
  constructor(output) {
    super()

    const target = (output)
      ? fs.createWriteStream(output, { flags: 'a' })
      : process.stdout

    this.pipe(target)
  }
}

module.exports = {
  InputStream,
  OutputStream,
}