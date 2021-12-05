const { fromSrc } = global.testEnv

const {
  StorableInterface,
  doesImplementStorableInterface
} = require(fromSrc('app/model/storable-interface'))

describe('storable-interface', () => {

  describe('StorableInterface', () => {

    describe('#toPlain()', () => {

      it('should thrown an error', () => {
        const instance = new StorableInterface()
        const callToPlain = () => instance.toPlain()
        expect(callToPlain).toThrow('it is not implemented')
      });
    });
  });

  describe('doesImplementStorableInterface()', () => {
    it('should return false if passed value is not an instance of Storable interface', () => {
      const implementer = {}
      expect(doesImplementStorableInterface(implementer)).toBe(false)
    });

    it('should return false if passed value does not implement toPlain method', () => {

      class Implermenter extends StorableInterface {}

      const implementer = new Implermenter()
      expect(doesImplementStorableInterface(implementer)).toBe(false)
    });

    it('should return false if passed value implements toPlain method as property', () => {

      class Implermenter extends StorableInterface {}
      const implementer = new Implermenter()
      implementer.toPlain = 'string'

      expect(doesImplementStorableInterface(implementer)).toBe(false)
    });

    it('should return true if passed value implements StorableInterface', () => {

      class Implermenter extends StorableInterface {}
      const implementer = new Implermenter()
      implementer.toPlain = () => {}

      expect(doesImplementStorableInterface(implementer)).toBe(true)
    });
  });
});