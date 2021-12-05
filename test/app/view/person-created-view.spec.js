const {
  fromSrc,
} = global.testEnv

jest.mock(fromSrc('app/view/person-view'))

const { personView } = require(fromSrc('app/view/person-view'))
const { personCreatedView } = require(fromSrc('app/view/person-created-view'))

describe('person-created-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('personCreatedView()', () => {

    it('should call personView', () => {
      personCreatedView({}, {}, {})
      expect(personView).toHaveBeenCalled()
    });

    it('should pass person option to the personView', () => {
      const req = {}
      const res = {}
      const person = {}
      const statusCode = 201

      personCreatedView(req, res, { person })
      expect(personView).toHaveBeenCalledWith(req, res, { person, statusCode })
    });

    it('should pass status code 201 to the personView', () => {
      const req = {}
      const res = {}
      const person = {}
      const statusCode = 201

      personCreatedView(req, res, { person })
      expect(personView).toHaveBeenCalledWith(req, res, { person, statusCode })
    });
  });
});