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

    it('Should extend RotTransformer', function () {
      const caesarDecoder = new CaesarDecoder()
      expect(caesarDecoder).toBeInstanceOf(RotTransformer)
    })

    it('Should have shifting equal to 1', function () {
      const caesarDecoder = new CaesarDecoder()
      expect(caesarDecoder.shifting).toBe(1)
    })

    it('Should have direction LEFT', function () {
      const caesarDecoder = new CaesarDecoder()
      expect(caesarDecoder.direction).toBe(DIRECTION_.LEFT)
    })
  });

  describe('Rot8Encoder', function () {

    it('Should extend RotTransformer', function () {
      const rot8Encoder = new Rot8Encoder()
      expect(rot8Encoder).toBeInstanceOf(RotTransformer)
    })

    it('Should have shifting equal to 8', function () {
      const rot8Encoder = new Rot8Encoder()
      expect(rot8Encoder.shifting).toBe(8)
    })

    it('Should have direction RIGHT', function () {
      const rot8Encoder = new Rot8Encoder()
      expect(rot8Encoder.direction).toBe(DIRECTION_.RIGHT)
    })
  });

  describe('Rot8Decoder', function () {

    it('Should extend RotTransformer', function () {
      const rot8Decoder = new Rot8Decoder()
      expect(rot8Decoder).toBeInstanceOf(RotTransformer)
    })

    it('Should have shifting equal to 8', function () {
      const rot8Decoder = new Rot8Decoder()
      expect(rot8Decoder.shifting).toBe(8)
    })

    it('Should have direction LEFT', function () {
      const rot8Decoder = new Rot8Decoder()
      expect(rot8Decoder.direction).toBe(DIRECTION_.LEFT)
    })
  });
})
