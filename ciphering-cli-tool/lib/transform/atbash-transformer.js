const { Transform } = require('stream')

const {
  CODE_,
  isLowerCode,
  isUpperCode,
} = require('./helpers.js')

class AtbashTransformer extends Transform {
  _transform(data, _, done) {
    const transformed = [...data].map((code) => this._transformCode(code))
    done(null, Buffer.from(transformed))
  }

  _transformCode(code) {
    const { LOWER_A, UPPER_A } = CODE_

    if (isLowerCode(code)) {
      return this._transformNumber(code - LOWER_A) + LOWER_A
    }

    if (isUpperCode(code)) {
      return this._transformNumber(code - UPPER_A) + UPPER_A
    }

    return code
  }

  _transformNumber(number) {
    return 25 - number
  }
}

module.exports = { AtbashTransformer }