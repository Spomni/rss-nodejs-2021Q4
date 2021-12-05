const { createRouter, Router, setErrorHandler } = require('../../src/lib/router')
const { Request } = require('../../src/lib/request')

const {
  UnresolvedRequestError
} = require('../../src/contract/unresolved-request-error')

const handleError = jest.fn()

describe('router', () => {

  describe('createRouter()', () => {
    it('should return new instance of Router', () => {
      const first = createRouter()
      const second = createRouter()
      
      expect(first).toBeInstanceOf(Router)
      expect(second).toBeInstanceOf(Router)
      expect(second).not.toBe(first)
    })
  })
  
  describe('Router', () => {
    
    describe('constructor()', () => {
      
      it('should return function', () => {
        const router = createRouter()
        expect(router).toBeInstanceOf(Function)
      })
      
      it('should return instance of Router', () => {
        const router = createRouter()
        expect(router).toBeInstanceOf(Router)
      })
    })
    
    describe('#register()', () => {
    
      it('should throw an error if an option "path" is not mount point', () => {
        const router = createRouter()
        const register = () => router.register({ path: 'not', use: () => {}})

        expect(register).toThrow('is not a valid mount point')
      })

      it('should throw an error if an option "use" is not a function', () => {
        const router = createRouter()
        const register = () => router.register({ path: '/', use: {} })
        
        expect(register).toThrow('is not a function')
      })

      it('should throw an error if any leading part of path has been registered earlier', () => {
        
        const router = createRouter()
        
        router.register({
          path: '/some',
          use: () => {},
        })
        
        const register = () => router.register({
          path: '/some/path',
          use: () => {},
        })
        
        expect(register).toThrow('has already been registered')
      })
      
      it('should works with many config arguments', () => {

        const use = () => {}
        const pathes = ['/one', '/two', '/three']
        const fixture = pathes.map((path) => ({ path, use }))
        const router = createRouter()
        
        router.register(...fixture)
        
        expect(router.pathes).toEqual(pathes)
      })
    })

    describe('#patches', () => {
      it('should return all registered pathes', () => {
        const use = () => {}
        const pathes = ['/one', '/two', '/three']
        const fixture = pathes.map((path) => ({ path, use }))
        const router = createRouter()
        
        fixture.forEach((config) => router.register(config))

        expect(router.pathes).toEqual(pathes)
      })
    })
    
    describe('instance()', () => {
      
      it('should throw an UnresolvedRequestError instance if it has no registered path matches request url', () => {
        const router = createRouter()
        const response = {}

        router.register({
          path: '/some/path',
          use: () => {}
        })
        
        const incomingMessage = {
          url: '/another'
        }
        
        const request = {
          url: '/some/another/path',
          mountPoint: '/some',
          path: '/another/path'
        }
        
        const routeIncomingMessage = () => router(incomingMessage, response)
        const routeRequest = () => router(request, response)
        
        expect(routeIncomingMessage).toThrow(UnresolvedRequestError)
        expect(routeRequest).toThrow(UnresolvedRequestError)
      })

      it('should call registered callback related with passed request', () => {
        const router = createRouter()
        const response = {}

        const incomingMessage = { url: '/some/path/to/resourse' }

        const request = {
          url: '/long/some/path/to/resourse',
          mountPoint: '/long',
          path: '/some/path/to/resourse'
        }

        const useSpy = jest.fn()
        
        router.register(
          {
            path: '/some/path/to',
            use: useSpy
          }
        )
        
        router(incomingMessage, response)
        router(request, response)
        
        expect(useSpy.mock.calls.length).toBe(2)
      })
      
      it('registered callback should be called with nested request and original response', () => {
        const router = createRouter()
        const response = {}
        
        const incomingMessage = { url: '/some/path/to/resourse' }
        
        const request = {
          url: '/long/some/path/to/resourse',
          mountPoint: '/long',
          path: '/some/path/to/resourse'
        }
        
        const useSpy = jest.fn()
        
        const route = {
          path: '/some/path/to',
          use: useSpy
        }
        
        router.register(route)
        
        router(incomingMessage, response)

        let useReq = useSpy.mock.calls[0][0]
        let useRes = useSpy.mock.calls[0][1]

        expect(useReq).toBeInstanceOf(Request)
        expect(useReq.mountPoint).toBe(route.path)
        expect(useRes).toBe(response)

        router(request, response)
        
        useReq = useSpy.mock.calls[1][0]
        useRes = useSpy.mock.calls[1][1]
        
        expect(useReq).toBeInstanceOf(Request)
        expect(useReq.mountPoint).toBe(request.mountPoint + route.path)
        expect(useRes).toBe(response)
      })
    })
  })
  
  describe('setErrorHandler()', () => {
  
    beforeAll(() => setErrorHandler(handleError))
  
    it('should setup Router constructor to use passed function to handle errors', () => {
      const router = createRouter()
      const req = { url: '/some/path' }
      const res = {}
      
      router(req, res)
      
      expect(handleError).toHaveBeenCalled()
    })
    
    it('should setup constructor to apply handler to new instances only', () => {

      const router = createRouter()
      const req = { url: '/some/path' }
      const res = {}

      setErrorHandler(() => {
        throw new Error('test')
      })
      handleError.mockClear()

      expect(() => router(req, res)).not.toThrow()
      expect(handleError).toHaveBeenCalled()

      setErrorHandler(handleError)
    })

    it('error handler should be called to handle UnresolvedRequestError', () => {
      const router = createRouter()
      const req = { url: '/some/path' }
      const res = {}
      
      handleError.mockClear()
      
      router(req, res)
      
      expect(handleError).toHaveBeenCalled()
    })

    it('error handler should be called to handle errors of the use callback', () => {
      const path = '/some/path'
      const error = new Error('test')
      const use = () => { throw error }
      const req = { url: path }
      const res = {}
      
      const router = createRouter()
      
      router.register({ path, use })
      
      const callRouter = () => router(req, res)
      handleError.mockClear()
      
      expect(callRouter).not.toThrow()
      expect(handleError).toHaveBeenCalled()
    })

    it('error handler should receive request, response and error as arguments', () => {
      const path = '/some/path'
      const error = new Error('test')
      const use = () => { throw error }
      const req = { url: path }
      const res = {}
      
      const router = createRouter()
      
      router.register({ path, use })
      
      const callRouter = () => router(req, res)
      handleError.mockClear()
      
      expect(callRouter).not.toThrow()
      expect(handleError).toHaveBeenCalledWith(req, res, error)
    })
  })
})