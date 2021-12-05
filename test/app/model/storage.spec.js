const { fromSrc } = global.testEnv

const { createStorage } = require(fromSrc('app/model/storage'))

describe('storage', () => {

  describe('createStorage()', () => {
    it('should return an empty array', () => {
      expect(createStorage()).toEqual([])
    })
  });
});
