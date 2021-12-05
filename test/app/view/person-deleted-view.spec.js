const {
  fromSrc,
} = global.testEnv

const matchers = require('jest-extended')
expect.extend(matchers)

const { personDeletedView } = require(fromSrc('app/view/person-deleted-view'))

const defaultResponse = {
  writeHead: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}

describe('person-deleted-view', () => {

  describe('personDeletedView()', () => {

    it('should set status code 204', () => {
      const req = {}
      const res = defaultResponse

      personDeletedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][0]).toBe(204)
    });

    it('should set status message "No Content"', () => {
      const req = {}
      const res = defaultResponse

      personDeletedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][1]).toBe('No Content')
    });

    it('should set content-type "text/plain; charset=UTF-8"', () => {
      const req = {}
      const res = defaultResponse

      personDeletedView(req, res)

      expect(res.writeHead).toHaveBeenCalled()
      expect(res.writeHead.mock.calls[0][2]).toBeObject()

      const contentType = res.writeHead.mock.calls[0][2]['Content-Type']
      expect(contentType).toBe('text/plain; charset=UTF-8')
    });

    it('should be ended without body', () => {
      const req = {}
      const res = defaultResponse

      personDeletedView(req, res)

      expect(res.write).not.toHaveBeenCalled()
      expect(res.end).toHaveBeenCalledWith()
    });
  });
});