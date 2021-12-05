const {
  fromSrc,
  fromTest,
} = global.testEnv

jest.mock(fromSrc('app/view/400-bad-request-view'))
jest.mock(fromSrc('app/view/404-resource-not-found-view'))
jest.mock(fromSrc('app/view/person-updated-view'))
jest.mock(fromSrc('app/lib/uuid'))
jest.mock(fromSrc('app/model/crud/person-api'))

const { badRequestView } = require(fromSrc('app/view/400-bad-request-view'))
const { resourceNotFoundView } = require(fromSrc('app/view/404-resource-not-found-view'))
const { personUpdatedView } = require(fromSrc('app/view/person-updated-view'))

const { createRequest } = require(fromSrc('lib/request'))
const uuid = require(fromSrc('app/lib/uuid'))
const personApi = require(fromSrc('app/model/crud/person-api'))

const { ParentRequest } = require(fromTest('__helpers/parent-request'))
const { defaultPersonLike } = require(fromTest('__helpers/default-person-like'))

const { updatePerson } = require(fromSrc('app/controller/person-controller/update-person'))

describe('update-person', () => {

  afterEach(() => jest.resetAllMocks())

  describe('updatePerson', () => {

    it('should call badRequestView() if a request body is not correct json string', async () => {

      const url = '/person/uuid'
      const mountPoint = '/person'

      const req = createRequest(new ParentRequest(url), { mountPoint })

      const res = {}

      const body = '{ id: "uuid" }'
      let message = null

      try {
        message = JSON.parse(body)
      } catch (error) {
        message = error.message
      }

      req.end(body)

      uuid.validate.mockReturnValue(true)

      const person = await updatePerson(req, res)

      expect(badRequestView).toBeCalledWith(req, res, { message })
      expect(person).toBe(null)
    });

    it('should call notFoundView() if person with passed id is not found', async () => {

      const url = '/person/uuid'
      const mountPoint = '/person'

      const req = createRequest(new ParentRequest(url), { mountPoint })
      const res = {}
      const body = JSON.stringify(defaultPersonLike)
      req.end(body)

      personApi.getById.mockReturnValue(null)

      const person = await updatePerson(req, res)

      expect(resourceNotFoundView).toHaveBeenCalledWith(req, res)
      expect(person).toBe(null)
    });

    describe('should call badRequestView() if a parsed request body is not valid personLike object', () => {

      it.each(
        [
          ['empty object', { empty: true }],
          ['invalid id', { id: 'not-uuid' }],
          ['invalid name', { name: ['Joe', 'Pit'] }],
          ['invalid age', { age: 'nineteen' }],
          ['invalid hobbies', { hobbies: "singing" }],
        ]
      )('%s', async (caseName, extendWith) => {

        const personLike = (!extendWith.empty)
            ? Object.assign({}, defaultPersonLike, extendWith)
            : {}

        const message = 'message'
        const propName = caseName.replace('invalid ', '')

        if (!extendWith.empty) {
          personApi.getById.mockReturnValue({
            get [propName]() {},
            set [propName](value) {
              throw new Error(message)
            }
          })
        } else {
          personApi.getById.mockImplementation(() => {
            throw new Error(message)
          })
        }


        if (extendWith.id && extendWith.id === 'uuid') {
          uuid.validate.mockReturnValue(true)
        } else {
          uuid.validate.mockReturnValue(false)
        }

        const url = '/person/uuid'
        const mountPoint = '/person'

        const req = createRequest(new ParentRequest(url), { mountPoint })
        const body = JSON.stringify(personLike)
        const res = {}
        req.end(body)

        const person = await updatePerson(req, res)

        expect(badRequestView).toBeCalledWith(req, res, { message })
        expect(person).toBe(null)
      })
    });

    it('should call personCreatedView with a copy of the request person object', async () => {

      personApi.getById.mockReturnValue(Object.assign({}, defaultPersonLike))
      personApi.update.mockReturnValue(Object.assign({}, defaultPersonLike))

      const url = '/person/uuid'
      const mountPoint = '/person'

      const req = createRequest(new ParentRequest(url), { mountPoint })
      const body = JSON.stringify(defaultPersonLike)
      const res = {}
      req.end(body)

      const person = await updatePerson(req, res)

      expect(person).not.toBe(null)
      expect(person).not.toBe(defaultPersonLike)
      expect(person).toEqual(defaultPersonLike)
      expect(personUpdatedView).toBeCalledWith(req, res, { person })
    });
  });
});