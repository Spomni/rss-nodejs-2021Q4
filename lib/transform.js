const { Transform } = require('stream')

const DIRECTION_ = {
  RIGHT: 'right',
  LEFT: 'left'
}

const CODE_ = {
  LOWER_A: 97,
  LOWER_Z: 122,
  UPPER_A: 65,
  UPPER_Z: 90,
}

function isLowerCode(code) {
  return code >= CODE_.LOWER_A && code <= CODE_.LOWER_Z
}

function isUpperCode(code) {
  return code >= CODE_.UPPER_A && code <= CODE_.UPPER_Z
}

function isValidDirection(direction) {
  return direction === DIRECTION_.RIGHT || direction === DIRECTION_.LEFT
}

function isValidSifting(shifting) {
  return typeof shifting === 'number'
    && shifting > 0
    && shifting % 1 === 0
}

class RotTransformerError extends Error {}

class InvalidShiftingError extends RotTransformerError {
  constructor() {
    super('the "shifting" option must be a non-negative integer')
  }
}

class InvalidDirectionError extends RotTransformerError {
  constructor() {
    super(`the "direction" option must has value ${DIRECTION_.LEFT} or ${DIRECTION_.RIGHT}`)
  }
}

class RotTransformer extends Transform {

  constructor(shifting, direction) {
    super()
    
    if (!isValidSifting(shifting)) {
      throw new InvalidShiftingError()
    }
    
    if (!isValidDirection(direction)) {
      throw new InvalidDirectionError(direction)
    }

    this._shifting = shifting
    this._direction = direction
  }

  get shifting() {
    return this._shifting
  }
  
  get direction() {
    return this._direction
  }
  
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
    if (this._direction === DIRECTION_.RIGHT) {
      return this._shiftNumberRight(number)
    } else {
      return 25 - this._shiftNumberRight(25 - number)
    }
  }

  _shiftNumberRight(number) {
    const shifted = number + this._shifting
    return (shifted > 25)
      ? shifted % 26
      : shifted
  }
}

RotTransformer.DIRECTION_ = DIRECTION_
RotTransformer.RotTransformerError = RotTransformerError

class CaesarEncoder extends RotTransformer {
  constructor() {
    super(1, DIRECTION_.RIGHT)
  }
}

class CaesarDecoder extends RotTransformer {
  constructor() {
    super(1, DIRECTION_.LEFT)
  }
}

class Rot8Encoder extends RotTransformer {
  constructor() {
    super(8, DIRECTION_.RIGHT)
  }
}

class Rot8Decoder extends RotTransformer {
  constructor() {
    super(8, DIRECTION_.LEFT)
  }
}

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

module.exports = {
  RotTransformer,
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
}
