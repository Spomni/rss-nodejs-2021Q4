const { Transform, Readable, PassThrough } = require('stream')

const matchers = require('jest-extended')
expect.extend(matchers);

const { RotTransformer } = require('../../lib/transform/rot-transformer')
const { DIRECTION_ } = RotTransformer

const CODE_ = {
  LOWER_A: 97,
  LOWER_Z: 122,
  UPPER_A: 65,
  UPPER_Z: 90,
}

async function testTransformer(transformer, inputData, callback) {
  return new Promise((resolve, reject) => {

    const input = new Readable({ read: () => {} })
    const output = new PassThrough()

    output.on(`data`, (data) => {
      try {
        callback(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    input
      .pipe(transformer)
      .pipe(output)

    input.push(inputData)
  })
}

describe('RotTransformer', () => {

  describe('static', () => {
    describe('DIRECTION_', () => {

      it('Should return an object', function () {
        expect(DIRECTION_).toBeObject()
      })

      it('Should have a property RIGHT', function () {
        expect(DIRECTION_).toHaveProperty('RIGHT')
      })

      it('Should have a property LEFT', function () {
        expect(DIRECTION_).toHaveProperty('LEFT')
      })
    });
  });

  describe('constructor()', () => {

    it('Should throw an error if invalid shifting is passed', function () {
      expect(() => new RotTransformer('many', DIRECTION_.RIGHT)).toThrow()
    })

    it('Should throw an error if invalid direction is passed', function () {
      expect(() => new RotTransformer(1, 'forward')).toThrow()
    })

    it('should return a Transform stream', function () {
      expect(new RotTransformer(5, DIRECTION_.LEFT)).toBeInstanceOf(Transform)
    })
  });

  describe('shifting', () => {
    it('Should return value passed to the constructor', function () {
      const shifting = 3
      const rot = new RotTransformer(3, DIRECTION_.RIGHT)
      expect(rot.shifting).toBe(shifting)
    })
  });

  describe('direction', () => {
    it('should return value passed to the constructor', function () {
      ;[DIRECTION_.LEFT, DIRECTION_.RIGHT].forEach((direction) => {
        const rot = new RotTransformer(8, direction)
        expect(rot.direction).toBe(direction)
      })
    })
  });

  describe('_transform', () => {

    it('Should increase codes by shifting if direction is RIGHT', async function () {

      const shifting = 7

      const fixture = [
        [CODE_.LOWER_A, CODE_.LOWER_A + shifting],
        [CODE_.LOWER_Z, CODE_.LOWER_A + shifting - 1],
        [CODE_.LOWER_A + 13, CODE_.LOWER_A + 13 + shifting],
        [CODE_.UPPER_A, CODE_.UPPER_A + shifting],
        [CODE_.UPPER_Z, CODE_.UPPER_A + shifting - 1],
        [CODE_.UPPER_A + 13, CODE_.UPPER_A + 13 + shifting],
      ]

      const rot = new RotTransformer(shifting, DIRECTION_.RIGHT)

      for (let [input, output] of fixture) {
        await testTransformer(rot, Buffer.from([input]), (data) => {
          expect(data[0]).toBe(output)
        })
      }
    })

    it('Should decrease codes by shifting if direction is LEFT', async function () {

      const shifting = 12

      const fixture = [
        [CODE_.LOWER_Z, CODE_.LOWER_Z - shifting],
        [CODE_.LOWER_A, CODE_.LOWER_Z - shifting + 1],
        [CODE_.LOWER_A + 13, CODE_.LOWER_A + 13 - shifting],
        [CODE_.UPPER_Z, CODE_.UPPER_Z - shifting],
        [CODE_.UPPER_A, CODE_.UPPER_Z - shifting + 1],
        [CODE_.UPPER_A + 13, CODE_.UPPER_A + 13 - shifting],
      ]

      const rot = new RotTransformer(shifting, DIRECTION_.LEFT)

      for (let [input, output] of fixture) {
        await testTransformer(rot, Buffer.from([input]), (data) => {
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

      const rot = new RotTransformer(26, DIRECTION_.RIGHT)

      await testTransformer(rot, Buffer.from(input), (data) => {
        expect([...data]).toEqual(input)
      })
    })
  });
});