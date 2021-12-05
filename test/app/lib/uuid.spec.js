const matchers = require('jest-extended')
expect.extend(matchers)

const { fromSrc } = global.testEnv

const { generate, validate } = require(fromSrc('app/lib/uuid'))

describe('uuid', () => {

  describe('generate()', () => {

    it('should generate unique uuid string', () => {
      const callsCount = 100
      const idList = []

      ;[...Array(callsCount)].forEach(() => {
        const id = generate()

        expect(id).toBeString()
        expect(idList.includes(id)).toBe(false)

        idList.push(id)
      })
    });
  });

  describe('validate()', () => {

    it('should return true if passed value is uuid', () => {
      const id = generate()
      expect(validate(id)).toBe(true)
    });

    it('should return false if passed value is not uuid', () => {
      const id = 'uuid'
      expect(validate(id)).toBe(false)
    });
  });
});