const { fromSrc } = global.testEnv

jest.mock(fromSrc('app/view/400-bad-request-view'))
jest.mock(fromSrc('app/view/person-created-view'))
jest.mock(fromSrc('app/lib/uuid'))
jest.mock(fromSrc('app/model/crud/person-api'))

const { PassThrough } = require('stream')

const { badRequestView } = require(fromSrc('app/view/400-bad-request-view'))
const { personCreatedView } = require(fromSrc('app/view/person-created-view'))
const { createRequest } = require(fromSrc('lib/request'))
const { createPerson } = require(fromSrc('app/controller/person-controller/create-person'))
const uuid = require(fromSrc('app/lib/uuid'))
const personApi = require(fromSrc('app/model/crud/person-api'))

class ParentRequest extends PassThrough {

  constructor() {
    super()
    this.url = '/some/path/to'
  }
}

const defaultPersonLike = {
  id: 'uuid',
  name: 'Joe',
  age: 19,
  hobbies: ['singing']
}

describe('create-person', () => {

  afterEach(() => jest.resetAllMocks())

  describe('createPerson()', () => {

    it('should be async function', async () => {
      const req = createRequest(new ParentRequest(), { mountPoint: '/some' })
      req.end('body')
      const res = {}
      const promise = createPerson(req, res)

      expect(promise).toBeInstanceOf(Promise)

      await promise
    });

    it('should call badRequestView() if a request body is not correct json string', async () => {

      const req = createRequest(new ParentRequest(), { mountPoint: '/some' })
      const res = {}

      const body = '{ id: "uuid" }'
      let message = null

      try {
        message = JSON.parse(body)
      } catch (error) {
        message = error.message
      }

      req.end(body)

      await createPerson(req, res)

      expect(badRequestView).toBeCalledWith(req, res, { message })
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

          if (extendWith.id && extendWith.id === 'uuid') {
            uuid.validate.mockReturnValue(true)
          } else {
            uuid.validate.mockReturnValue(false)
          }

          const req = createRequest(new ParentRequest(), { mountPoint: '/some'} )
          const body = JSON.stringify(personLike)
          const res = {}
          req.end(body)

          const message = 'message'
          personApi.create.mockImplementation(() => {
            throw new Error(message)
          })

          await createPerson(req, res)

          expect(badRequestView).toBeCalledWith(req, res, { message })
      })
    });

    it('should call personCreatedView with a copy of the request person object', async () => {

      uuid.validate.mockReturnValue(true)

      const req = createRequest(new ParentRequest(), { mountPoint: '/some'} )
      const res = {}
      const body = JSON.stringify(defaultPersonLike)
      req.end(body)

      const person = Object.assign({}, defaultPersonLike)
      personApi.create.mockReturnValue(person)

      await createPerson(req, res)

      expect(personCreatedView).toBeCalledWith(req, res, { person })
    });
  });
});
