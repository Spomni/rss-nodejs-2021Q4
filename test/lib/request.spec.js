const matchers = require('jest-extended')
expect.extend(matchers)

const { PassThrough } = require('stream')
const { Request, createRequest } = require('../../src/lib/request')

class ParentRequest extends PassThrough {
  constructor() {
    super()
    this.url = '/some/path/to/resource?prop=value'
  }
}

describe('request', () => {

  describe('createRequest', () => {

    it('Should return new Request instance', () => {
      const parent = new ParentRequest()
      const options = { mountPoint: '/' }

      const firstRequest = createRequest(parent, options)
      const secondRequest = createRequest(parent, options)

      expect(secondRequest).not.toBe(firstRequest)
    })
  })

  describe('Request', () => {

    describe('constructor()', () => {

      it('Should throw an error if the parent mountPoint concatenated with passed one is not leading part of the parent property "url"', () => {
        const fixture = [
          {},
          '',
          'path1/to/2',
          '/asd/',
          '/asd?some',
          '/path1//to/2',
        ]

        fixture.forEach((mountPoint) => {
          expect(() => createRequest({}, { mountPoint })).toThrow('not valid mountPoint')
        })
      })

      it('Should throw an error if mountPoint leads to the same url like parent mountPoint', () => {
        const parent = new ParentRequest()
        parent.mountPoint = '/some/path'

        expect(() => createRequest(parent, { mountPoint: '/' })).toThrow('must not be equal to parent')
      })

      it('Should throw an error if new mountPoint is not leading part of parent url', () => {
        const parent = new ParentRequest()
        const mountPoint = '/another/path'
        const construct = () => createRequest(parent, { mountPoint })

        expect(construct).toThrow('is not part of parent url')
      })
    })

    describe('instance', () => {

      it('Should be instance of Request', () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        expect(request).toBeInstanceOf(Request)
      })

      it('Should have parent request in the prototype chain', () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })
        const firstProto = Object.getPrototypeOf(request)
        const secondProto = Object.getPrototypeOf(Request.prototype)

        expect(secondProto).toBe(parent)
      })
    })

    describe('#mountPoint', () => {

      it('Should be read only property', () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        const original = request.mountPoint
        request.mountPoint = {}

        expect(request.mountPoint).toBe(original)
      })

      it('Should trail a parent request property "mountPoint"', () => {
        const parent = new ParentRequest()
        parent.mountPoint = '/some/path'
        const mountPoint = '/to'
        const request = createRequest(parent, { mountPoint })

        expect(request.mountPoint).toBe(parent.mountPoint + mountPoint)
      })

      it('Should has a value passed to the constructor if parent request has no property "mountPoint"', () => {
        const parent = new ParentRequest()
        const mountPoint = '/some/path'
        const request = createRequest(parent, { mountPoint })

        expect(request.mountPoint).toBe(mountPoint)
      })
    })

    describe('#path', () => {

      it('Should be read only', () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        const original = request.path
        request.path = {}

        expect(request.path).toBe(original)
      })

      it('Should be a rest of parent url after excluding current mountPoint query and trailing slash', () => {
        const parentPath = '/some/path/to'
        const mountPoint = '/some'
        const path = parentPath.replace(mountPoint, '')
        const url = parentPath + '/?param=value'

        const parent = { url, mountPoint: '/' }
        const request = createRequest(parent, { mountPoint })

        expect(request.path).toBe(path)
      })
    })

    describe('#readBody()', () => {

      it('should return promise', async () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        expect(request.readBody()).toBeInstanceOf(Promise)
      })

      it('should resolve body as string', async () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        const body = 'some body'
        parent.end(body)

        await expect(request.readBody()).resolves.toBe(body)
      });

      it('should return the same value again', async () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        const body = 'some body'
        parent.end(body)

        await expect(request.readBody()).resolves.toBe(body)
        await expect(request.readBody()).resolves.toBe(body)
      });

      it('should be rejected if a request emit "error" event', async () => {
        const parent = new ParentRequest()
        const request = createRequest(parent, { mountPoint: '/' })

        const promise = request.readBody()

        const error = new Error('test error')
        parent.emit('error', error)

        expect(promise).rejects.toBe(error)
      })
    });
  })
})
