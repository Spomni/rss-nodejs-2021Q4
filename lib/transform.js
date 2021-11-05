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

class RotTransformer extends Transform {

  constructor(shifting, direction) {
    super()
    
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
    if (this._shifting === DIRECTION_.RIGHT) {
      return shiftNumberRight(number)
    } else {
      return 25 - shiftNumberRight(25 - number)
    }
  }

  this._shiftNumberRight(number) {
    const shifted = number + this._shifting
    return (shifted > 25)
      ? shifted % 26
      : shifted
    }
  }
}

RotTransformer.DIRECTION_ = DIRECTION_
