const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { internalServerErrorView } = require(fromSrc('app/view/500-internal-server-error-view'))

const defaultResponse = {
  writeHead: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}

describe('404-resource-not-found-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('internalServerErrorView()', () => {

    it('should set status code 500', () => {
      const req = {}
      const res = defaultResponse

      internalServerErrorView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(500)
    });

    it('should set status message "Internal Server Error"', () => {
      const req = {}
      const res = defaultResponse

      internalServerErrorView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('Internal Server Error')
    });

    it('should set content-type "text/plain; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse

      internalServerErrorView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('text/plain; charset=UTF-8')
    });

    it('should be ended without body', () => {
      const req = {}
      const res = defaultResponse

      internalServerErrorView(req, res)

      expect(res.write).not.toHaveBeenCalled()

      const body = res.end.mock.calls[0][0]
      expect(body).toMatch('The server has encountered a situation it does not know how to handle')
    });
  });
});
