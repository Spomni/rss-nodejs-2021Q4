const matchers = require('jest-extended')
expect.extend(matchers)

jest.mock('../../src/lib/router')
jest.mock('../../src/app/error-handler')
jest.mock('../../src/app/controller/person-controller')

const {
  setErrorHandler,
  createRouter,
  Router
} = require('../../src/lib/router')

const { handleError } = require('../../src/app/error-handler')
const { createApp } = require('../../src/app')
const { personController } = require('../../src/app/controller/person-controller')

createRouter.mockReturnValue({ register: jest.fn() })

describe('app', () => {
  
  describe('createApp', () => {

    it('should setup router module to use app error handler by default', () => {
      createApp()
      expect(setErrorHandler).toHaveBeenCalledWith(handleError)
    })

    it('should return a router instance', () => {
      const app = createApp()
      expect(app).toBe(createRouter())
    })

    it('should create returned instance later than router error handler was setup', () => {
      setErrorHandler.mockClear()
      createRouter.mockClear()
      
      createApp()
      
      expect(createRouter).toHaveBeenCalledAfter(setErrorHandler)
    })

    it(`should register personControler at the path "/person"`, () => {

      const { register } = createRouter()
      register.mockClear()

      createApp()
      
      const route = register.mock.calls[0][0]
      const { path, use } = route

      expect(path).toBe('/person')
      expect(use).toBe(personController)
    })
  })
})