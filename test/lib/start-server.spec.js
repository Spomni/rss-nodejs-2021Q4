jest.mock('http', () => {
  const serverMock = { listen: jest.fn() }
  const createServerMock = jest.fn(() => serverMock)

  return { createServer: createServerMock }
})

jest.mock('dotenv')

jest.mock('../../src/app', () => {
  return { createApp: jest.fn() }
})

jest.spyOn(console, 'log')

const { createServer } = require('http')
const dotenv = require('dotenv')
const { startServer } = require('../../src/lib/start-server')
const { createApp } = require('../../src/app')

describe('start-server', () => {

  describe('startServer()', () => {
  
    it('should call dotenv.config()', () => {
      startServer()
      expect(dotenv.config).toHaveBeenCalled()
    })

    it('should create app using createApp function', () => {
       createApp.mockClear()
       startServer()
       expect(createApp).toHaveBeenCalled()
     })

    it('should create server calling http.createServer() with argument returned from the createApp() function', () => {
      const app = () => {}
      createApp.mockReturnValueOnce(app)
      
      startServer()
      
      expect(createServer).toHaveBeenLastCalledWith(app)
    })

    it('should start server listening using default port and host if env variables are not defined', () => {
      const port = 3000
      const host = 'localhost'
      
      const listen = jest.fn()
      createServer.mockReturnValueOnce({ listen })

      startServer()
      
      const usedPort = listen.mock.calls[0][0]
      const usedHost = listen.mock.calls[0][1]

      expect(usedPort).toBe(port)
      expect(usedHost).toBe(host)
    })

    it('should start listening server using constants PORT and HOST from process.env if they are defined', () => {
      const port = '8080'
      const host = '127.0.0.1'
      
      process.env.PORT = port
      process.env.HOST = host

      const listen = jest.fn()
      createServer.mockReturnValueOnce({ listen })
      
      startServer()
      
      const usedPort = listen.mock.calls[0][0]
      const usedHost = listen.mock.calls[0][1]
      
      expect(usedPort).toBe(port)
      expect(usedHost).toBe(host)
      
      delete process.env.PORT
      delete process.env.HOST
    })

    it('should print human friendly message to the console when listening is started', (done) => {

      const listen = (p, h, cb) => cb()
      createServer.mockReturnValueOnce({ listen })

      console.log.mockClear()
      console.log.mockImplementationOnce(() => {})

      const timer = setTimeout(() => {
        clearInterval(interval)
        done(new Error('exceed timeout to log'))
      }, 3000)
      
      const interval = setInterval(() => {
        if (console.log.mock.calls.length > 0) {
          clearInterval(interval)
          clearTimeout(timer)
          
          const output = console.log.mock.calls[0][0]
          
          try {
            expect(output.toString()).toMatch('is started')
            done()
          } catch (error) {
            done(error)
          }
        }
      }, 100)
      
      startServer()
    })
  })
})