const {
  fromSrc,
} = global.testEnv

jest.mock(fromSrc('app/view/person-view'))

const { personView } = require(fromSrc('app/view/person-view'))
const { personUpdatedView } = require(fromSrc('app/view/person-updated-view'))

describe('person-updated-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('personUpdatedView()', () => {

    it('should call the personView() with the same arguments', () => {
      const req = {}
      const res = {}
      const person = {}

      personUpdatedView(req, res, { person })

      expect(personView).toHaveBeenCalledWith(req, res, { person })
    });
  });
});
