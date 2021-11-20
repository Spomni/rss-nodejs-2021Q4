const rot = require('../../lib/transform/rot-transformer')
const atbash = require('../../lib/transform/atbash-transformer')

const {
  RotTransformer,
  CaesarEncoder,
  CaesarDecoder,
  Rot8Encoder,
  Rot8Decoder,
  AtbashTransformer,
} = require('../../lib/transform')

const DIRECTION_ = RotTransformer.DIRECTION_

describe('transform', function () {

  describe('exports', function () {

    it('Should export RotTransformer', function () {
      expect(RotTransformer).toBe(rot.RotTransformer)
    })

    it('Should export AtbashTransformer', function () {
      expect(AtbashTransformer).toBe(atbash.AtbashTransformer)
    })
  });

  describe('CaesarEncoder', function () {

    it('Should extend RotTransformer', function () {
      const caesarEncoder = new CaesarEncoder()
      expect(caesarEncoder).toBeInstanceOf(RotTransformer)
    })

    it('Should have shifting equal to 1', function () {
      const caesarEncoder = new CaesarEncoder()
      expect(caesarEncoder.shifting).toBe(1)
    })

    it('Should have direction RIGHT', function () {
      const caesarEncoder = new CaesarEncoder()
      expect(caesarEncoder.direction).toBe(DIRECTION_.RIGHT)
    })
  });

  describe('CaesarDecoder', function () {
    it.todo('Should extend RotTransformer')
    it.todo('Should have shifting equal to 1')
    it.todo('Should have direction LEFT')
  });

  describe('Rot8Encoder', function () {
    it.todo('Should extend RotTransformer')
    it.todo('Should have shifting equal to 8')
    it.todo('Should have direction RIGHT')
  });

  describe('Rot8Encoder', function () {
    it.todo('Should extend RotTransformer')
    it.todo('Should have shifting equal to 8')
    it.todo('Should have direction LEFT')
  });
})
