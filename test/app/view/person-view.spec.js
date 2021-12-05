const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { personView } = require(fromSrc('app/view/person-view'))

const defaultResponse = {
  writeHead: jest.fn(),
  end: jest.fn(),
}

describe('person-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('personView()', () => {

    it('should set status code 200 by default', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 200
      const person = {}

      personView(req, res, { person })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(statusCode)
    });

    it('should set status code passed as option', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 201
      const person = {}

      personView(req, res, { person, statusCode })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(statusCode)
    });

    it('should set correct status message for code 200', () => {
      const req = {}
      const res = defaultResponse

      const person = {}

      personView(req, res, { person })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('OK')
    });

    it('should set correct status message for code 201', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 201
      const person = {}

      personView(req, res, { person, statusCode })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('Created')
    });

    it('should set a content-type header to "application/json; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 201
      const person = {}

      personView(req, res, { person, statusCode })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('application/json; charset=UTF-8')
    });

    it('should end with stringified person if it is passed', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 200
      const person = { name: 'Joe' }
      const stringifiedPerson = JSON.stringify(person)

      personView(req, res, { person, statusCode })

      expect(res.end).toHaveBeenCalledWith(stringifiedPerson)
    });

    it('should end with stringified personList if it is passed', () => {
      const req = {}
      const res = defaultResponse

      const statusCode = 200
      const personList = [{ name: 'Joe' }, { name: 'Pit' }]
      const stringifiedPersonList = JSON.stringify(personList)

      personView(req, res, { personList, statusCode })

      expect(res.end).toHaveBeenCalledWith(stringifiedPersonList)
    });
  });
});