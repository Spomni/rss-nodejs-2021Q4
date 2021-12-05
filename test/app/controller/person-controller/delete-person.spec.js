const {
  fromSrc,
  fromTest,
} = global.testEnv

jest.mock(fromSrc('app/view/400-bad-request-view'))
jest.mock(fromSrc('app/view/404-resource-not-found-view'))
jest.mock(fromSrc('app/view/person-deleted-view'))
jest.mock(fromSrc('app/lib/uuid'))
jest.mock(fromSrc('app/model/crud/person-api'))

const { badRequestView } = require(fromSrc('app/view/400-bad-request-view'))
const { resourceNotFoundView } = require(fromSrc('app/view/404-resource-not-found-view'))
const { personDeletedView } = require(fromSrc('app/view/person-deleted-view'))

const { createRequest } = require(fromSrc('lib/request'))
const uuid = require(fromSrc('app/lib/uuid'))
const personApi = require(fromSrc('app/model/crud/person-api'))

const { ParentRequest } = require(fromTest('__helpers/parent-request'))
const { defaultPersonLike } = require(fromTest('__helpers/default-person-like'))

const { deletePerson } = require(fromSrc('app/controller/person-controller/delete-person'))

describe('delete-person', () => {

  afterEach(() => jest.resetAllMocks())


  describe('deletePerson()', () => {

    it('call notFoundView() if person with passed id is not found', async () => {

      const req = createRequest(new ParentRequest(), { mountPoint: '/some'} )
      const res = {}
      const body = JSON.stringify(defaultPersonLike)
      req.end(body)

      personApi.getById.mockReturnValue(null)

      const result = await deletePerson(req, res)

      expect(resourceNotFoundView).toHaveBeenCalledWith(req, res)
      expect(result).toBe(null)
    });

    it('should call badRequestView() if a parsed request body object has an invalid person id', async () => {

      const personLike = { id: 'not-uuid' }

      const message = 'message'
      personApi.getById.mockImplementation(() => {
        throw new Error(message)
      })

      const req = createRequest(new ParentRequest(), { mountPoint: '/some'} )
      const body = JSON.stringify(personLike)
      const res = {}
      req.end(body)

      const result = await deletePerson(req, res)

      expect(badRequestView).toBeCalledWith(req, res, { message })
      expect(result).toBe(null)
    });

    it('should call personDeletedView', async () => {

      const person = Object.assign({}, defaultPersonLike)
      personApi.getById.mockReturnValue(person)

      const req = createRequest(new ParentRequest(), { mountPoint: '/some'} )
      const body = JSON.stringify({ id: 'uuid' })
      const res = {}
      req.end(body)

      const result = await deletePerson(req, res)

      expect(personApi.delete).toHaveBeenCalledWith(person)
      expect(personDeletedView).toBeCalledWith(req, res)
      expect(result).toBe(true)
    });
  });
});