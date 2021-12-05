const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { badRequestView } = require(fromSrc('app/view/400-bad-request-view'))

const defaultResponse = {
  writeHead: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}

describe('400-bad-request-view', () => {

  describe('badRequestView()', () => {

    it('should set status code 400', () => {
      const req = {}
      const res = defaultResponse
      const message = 'bad request message'

      badRequestView(req, res, { message })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(400)
    });

    it('should set status message "Bad Request"', () => {
      const req = {}
      const res = defaultResponse
      const message = 'bad request message'

      badRequestView(req, res, { message })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('Bad Request')
    });

    it('should set content-type "text/plain; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse
      const message = 'bad request message'

      badRequestView(req, res, { message })

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('text/plain; charset=UTF-8')
    });

    it('should be ended with passed message', () => {
      const req = {}
      const res = defaultResponse
      const message = 'bad request message'

      badRequestView(req, res, { message })

      expect(res.end).toHaveBeenCalledWith(message)
    });
  });
});