const {
  fromSrc,
} = global.testEnv

jest.mock(fromSrc('app/view/404-resource-not-found-view'))
jest.mock(fromSrc('app/view/person-view'))
jest.mock(fromSrc('app/view/invalid-person-id-view'))
jest.mock(fromSrc('app/model/crud/person-api'))
jest.mock(fromSrc('app/lib/uuid'))

const { resourceNotFoundView } = require(fromSrc('app/view/404-resource-not-found-view'))
const { personView } = require(fromSrc('app/view/person-view'))
const { invalidPersonIdView } = require(fromSrc('app/view/invalid-person-id-view'))

const personApi = require(fromSrc('app/model/crud/person-api'))
const uuid = require(fromSrc('app/lib/uuid'))

const { getPerson } = require(fromSrc('app/controller/person-controller/get-person'))

const res = {}

describe('get-person', () => {

  beforeEach(() => uuid.validate.mockReturnValue(true))
  afterEach(() => jest.resetAllMocks())

  describe('getPerson()', () => {

    it('should call resourceNotFoundView() if path continues after the chunk "/personId"', async () => {
      const req = { path: '/uuid/some'}
      const result = await getPerson(req, res)
      expect(resourceNotFoundView).toHaveBeenCalledWith(req, res)
      expect(result).toBe(null)
    });

    it('should call personView() with an option "personList" containing a result of the crud.person.getAll() calling', async () => {
      const req = { path: '' }
      const data = []
      personApi.getAll.mockReturnValue(data)
      const result = await getPerson(req, res)

      expect(personView).toHaveBeenCalledWith(req, res, { personList: data })
      expect(result).toBe(data)
    });

    it('should call invalidPersonIdView() if the path chunk "/personId" is invalid', async () => {

      const personId = 'not-uuid'
      const req = { path: `/${personId}` }

      uuid.validate.mockReturnValue(false)

      const result = await getPerson(req, res)

      expect(invalidPersonIdView).toHaveBeenCalledWith(req, res, { personId })
      expect(result).toBe(null)
    });

    it('should call the crud.person.getById() method with passed personId', async () => {
      const personId = 'uuid'
      const req = { path: `/${personId}` }
      const result = await getPerson(req, res)
      expect(personApi.getById).toHaveBeenCalledWith(personId)
      expect(result).toBe(null)
    });

    it('should call resourceNotFoundView() if a user with passed personId is not found', async () => {
      const req = { path: '/uuid' }
      personApi.getById.mockReturnValue(null)
      const result = await getPerson(req, res)
      expect(resourceNotFoundView).toHaveBeenCalledWith(req, res)
      expect(result).toBe(null)
    });

    it('should call personView() with an option "person" containing a result of the crud.person.getById() calling', async () => {
      const req = { path: '/uuid' }
      const person = {}

      personApi.getById.mockReturnValue(person)

      const result = await getPerson(req, res)

      expect(personView).toHaveBeenCalledWith(req, res, { person })
      expect(result).toBe(person)
    });
  });
});
