const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { resourceNotFoundView } = require(fromSrc('app/view/404-resource-not-found-view'))

const defaultResponse = {
  writeHead: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}

describe('404-resource-not-found-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('resourceNotFoundView()', () => {

    it('should set status code 404', () => {
      const req = {}
      const res = defaultResponse

      resourceNotFoundView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(404)
    });

    it('should set status message "Resource Not Found"', () => {
      const req = {}
      const res = defaultResponse

      resourceNotFoundView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('Resource Not Found')
    });

    it('should set content-type "text/plain; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse

      resourceNotFoundView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('text/plain; charset=UTF-8')
    });

    it('should be ended with human friendly message', () => {
      const req = {}
      const res = defaultResponse

      resourceNotFoundView(req, res)

      expect(res.write).not.toHaveBeenCalled()

      const body = res.end.mock.calls[0][0]
      expect(body).toMatch('resource is not found')
    });
  });
});
