jest.mock('../../lib/transform/rot-transformer')
jest.mock('../../lib/transform/atbash-transformer')

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
    it.todo('Should extend RotTransformer')
    it.todo('Should have shifting equal to 1')
    it.todo('Should have direction RIGHT')
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
