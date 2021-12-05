function fromSrc(filename) {
  return global.testEnv.fromSrc(filename)
}

function fromTest(filename) {
  return global.testEnv.fromTest(filename)
}

jest.mock(fromSrc('app/view/501-not-implemented-view'))
jest.mock(fromSrc('app/view/404-resource-not-found-view'))
jest.mock(fromSrc('app/controller/person-controller/get-person'), () => ({
  getPerson: jest.fn(() => Promise.resolve())
}))
jest.mock(fromSrc('app/controller/person-controller/create-person'), () => ({
  createPerson: jest.fn(() => Promise.resolve())
}))
jest.mock(fromSrc('app/controller/person-controller/update-person'), () => ({
  updatePerson: jest.fn(() => Promise.resolve())
}))
jest.mock(fromSrc('app/controller/person-controller/delete-person'), () => ({
  deletePerson: jest.fn(() => Promise.resolve())
}))
jest.mock(fromSrc('app/error-handler'))

const { notImplementedView } = require(fromSrc('app/view/501-not-implemented-view'))
const { resourceNotFoundView } = require(fromSrc('app/view/404-resource-not-found-view'))
const { personController } = require(fromSrc('app/controller/person-controller'))
const { getPerson } = require(fromSrc('app/controller/person-controller/get-person'))
const { createPerson } = require(fromSrc('app/controller/person-controller/create-person'))
const { updatePerson } = require(fromSrc('app/controller/person-controller/update-person'))
const { deletePerson } = require(fromSrc('app/controller/person-controller/delete-person'))
const { handleError } = require(fromSrc('app/error-handler'))

const { ParentRequest } = require(fromTest('__helpers/parent-request'))
const { createRequest } = require(fromSrc('lib/request'))

describe('person-controller', () => {

  describe('personController()', () => {

    beforeAll(() => jest.resetAllMocks())

    it('should call resourceNotFoundView() if request path has more than on chunks', () => {

      const url = '/person/uui/some/path'
      const mountPoint = '/person'
      const req = createRequest(new ParentRequest(url), { mountPoint })
      const res = {}

      const result = personController(req, res)

      expect(result).toBe(null)
      expect(resourceNotFoundView).toHaveBeenCalledWith(req, res)
    });

    it('should call notImplementedView() if a request has not implemented method', () => {

      const url = '/person/uui'
      const mountPoint = '/person'
      const req = createRequest(
        new ParentRequest(url, 'CONNECT'),
         { mountPoint }
      )
      const res = {}

      personController(req, res)

      expect(notImplementedView).toHaveBeenCalledWith(req, res)
    });

    it('should call the getPerson() if a request method is "GET"', () => {

      const url = '/person/uuid'
      const mountPoint = '/person'
      const req = createRequest(new ParentRequest(url), { mountPoint })
      const res = {}

      getPerson.mockImplementation(async () => {})

      personController(req, res)

      expect(getPerson).toHaveBeenCalledWith(req, res)
    });

    it('should call the createPerson() if a request method is "POST"', () => {

      const url = '/person/uuid'
      const mountPoint = '/person'
      const req = createRequest(new ParentRequest(url, 'POST'), { mountPoint })
      const res = {}

      createPerson.mockImplementation(async () => {})

      personController(req, res)

      expect(createPerson).toHaveBeenCalledWith(req, res)
    });

    it('should call the updatePerson() if a request method is "PUT"', () => {

      const url = '/person/uuid'
      const mountPoint = '/person'
      const req = createRequest(new ParentRequest(url, 'PUT'), { mountPoint })
      const res = {}

      updatePerson.mockImplementation(async () => {})

      personController(req, res)

      expect(updatePerson).toHaveBeenCalledWith(req, res)
    });

    it('should call the deletePerson() if a request method is "DELETE"', () => {

      const url = '/person/uuid'
      const mountPoint = '/person'
      const req = createRequest(new ParentRequest(url, 'DELETE'), { mountPoint })
      const res = {}

      deletePerson.mockImplementation(async () => {})

      personController(req, res)

      expect(deletePerson).toHaveBeenCalledWith(req, res)
    });

    it('should call handle error if some resolver method is rejected', (done) => {

      const fixture = [
        ['GET', getPerson],
        ['POST', createPerson],
        ['PUT', updatePerson],
        ['DELETE', deletePerson],
      ]

      const error = new Error('test error')

      for (let [method, mock] of fixture) {
        mock.mockImplementation(() => Promise.reject(error))

        const url = '/person/uuid'
        const mountPoint = '/person'
        const req = createRequest(new ParentRequest(url, method), { mountPoint })
        const res = {}

        personController(req, res)
      }

      setTimeout(() => {
        try {
          const calls = handleError.mock.calls

          calls.forEach(([req, res, rejected]) => {
            expect(rejected).toBe(error)
          })

          done()
        } catch (err) {
          done(err)
        }
      }, 100)
    });
  });
});
