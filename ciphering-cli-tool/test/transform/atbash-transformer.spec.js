const { Transform } = require('stream')

const { testTransformer } = require('../lib/test-transformer')

const { AtbashTransformer } = require('../../lib/transform/atbash-transformer')

const CODE_ = {
  LOWER_A: 97,
  LOWER_Z: 122,
  UPPER_A: 65,
  UPPER_Z: 90,
}


describe('AtbashTransformer', () => {

  describe('constructor()', () => {
    it('Should return a Transform stream', function () {
      expect(new AtbashTransformer()).toBeInstanceOf(Transform)
    })
  });

  describe('_transform', () => {
    it('Should replace letter code with its mirror view of the alphabet', async function () {

      const fixture = [
        [CODE_.LOWER_A, CODE_.LOWER_Z],
        [CODE_.LOWER_A + 12, CODE_.LOWER_Z - 12],
        [CODE_.LOWER_A + 6, CODE_.LOWER_Z - 6],
        [CODE_.UPPER_A, CODE_.UPPER_Z],
        [CODE_.UPPER_A + 12, CODE_.UPPER_Z - 12],
        [CODE_.UPPER_A + 6, CODE_.UPPER_Z - 6],
      ]

      const atbash = new AtbashTransformer()

      for (let [input, output] of fixture) {
        await testTransformer(atbash, Buffer.from([input]), (data) => {
          expect(data[0]).toBe(output)
        })
      }
    })

    it('Should change only codes of the english alphabet', async function () {

      const input = [
        CODE_.LOWER_A - 1,
        CODE_.LOWER_Z + 1,
        CODE_.UPPER_A - 1,
        CODE_.UPPER_Z + 1,
      ]

      const atbash = new AtbashTransformer()

      await testTransformer(atbash, Buffer.from(input), (data) => {
        expect([...data]).toEqual(input)
      })
    })
  });
});
