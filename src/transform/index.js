const { RotTransformer } = require('./rot-transformer')
const { AtbashTransformer } = require('./atbash-transformer')

const { DIRECTION_ } = RotTransformer

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

module.exports = {
  RotTransformer,
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
}
