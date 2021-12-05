const {
  fromSrc,
} = global.testEnv

jest.mock(fromSrc('app/view/400-bad-request-view'))

const { badRequestView } = require(fromSrc('app/view/400-bad-request-view'))
const { invalidPersonIdView } = require(fromSrc('app/view/invalid-person-id-view'))

describe('invalid-person-id-view', () => {

  describe('invalidPersonIdView()', () => {

    it('should call badRequestView', () => {
      const req = {}
      const res = {}

      invalidPersonIdView(req, res, { personId: 'not-uuid' })

      expect(badRequestView).toHaveBeenCalled()
    });

    it('should pass an error message to the badRequestView', () => {
      const req = {}
      const res = {}

      const personId = 'not-uuid'
      const message = `invalid person id "${personId}" was found`

      invalidPersonIdView(req, res, { personId })

      expect(badRequestView).toHaveBeenCalledWith(req, res, { message })
    });
  });
});