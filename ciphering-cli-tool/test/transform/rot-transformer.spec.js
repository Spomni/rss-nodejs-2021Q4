const { Transform } = require('stream')

const matchers = require('jest-extended')
expect.extend(matchers);

const { RotTransformer } = require('../../lib/transform/rot-transformer')
const { DIRECTION_ } = RotTransformer

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
    it.todo('Should return value passed to the constructor')
  });

  describe('direction', () => {
    it.todo('should return value passed to the constructor')
  });

  describe('_transform', () => {
    it.todo('Should increase codes by shifting if direction is RIGHT')
    it.todo('Should decrease codes by shifting if direction is LEFT')
    it.todo('Should change only codes of the english alphabet')
  });
});