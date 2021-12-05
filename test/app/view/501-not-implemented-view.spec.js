const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { notImplementedView } = require(fromSrc('app/view/501-not-implemented-view'))



const defaultResponse = {
  writeHead: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}

describe('404-resource-not-found-view', () => {

  beforeEach(() => jest.resetAllMocks())

  describe('notImplementedView()', () => {

    it('should set status code 501', () => {
      const req = {}
      const res = defaultResponse

      notImplementedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(501)
    });

    it('should set status message "Not Implemented"', () => {
      const req = {}
      const res = defaultResponse

      notImplementedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('Not Implemented')
    });

    it('should set content-type "text/plain; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse

      notImplementedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('text/plain; charset=UTF-8')
    });

    it('should be ended without body', () => {
      const req = {}
      const res = defaultResponse

      notImplementedView(req, res)

      expect(res.write).not.toHaveBeenCalled()
      expect(res.end).toHaveBeenCalledWith()
    });
  });
});
