jest.mock('../../src/app/view/500-internal-server-error-view')
jest.mock('../../src/app/view/404-resource-not-found-view')

const { UnresolvedRequestError } = require('../../src/contract/unresolved-request-error')
const { handleError } = require('../../src/app/error-handler')
const { internalServerErrorView } = require('../../src/app/view/500-internal-server-error-view')
const { resourceNotFoundView } = require('../../src/app/view/404-resource-not-found-view')

const { mockProcessEnv } = require('../__helpers/mock-process-env')

describe('error-handler', () => {

  describe('handleError()', () => {

    beforeEach(() => jest.resetAllMocks())

    it('should call resourceNotFoundView() if passed error is an instance of UnresolvedRequestError', () => {
      resourceNotFoundView.mockClear()
      handleError({}, {}, new UnresolvedRequestError())
      expect(resourceNotFoundView).toHaveBeenCalled()
    });

    it('should call internalServerErrorView() if passed error is not an instance of UnresolvedRequestError', () => {
      resourceNotFoundView.mockClear()
      handleError({}, {}, new Error())
      expect(internalServerErrorView).toHaveBeenCalled()
    });

    it('should call the console.error() method with error if an application is in development mode', async () => {

      jest.spyOn(console, 'error').mockImplementation(() => {})

      const error = new Error()

      await mockProcessEnv({ NODE_ENV: 'development' }, () => {
        handleError({}, {}, error)
        expect(console.error).toHaveBeenLastCalledWith(error)
      })

      console.error.mockRestore()
    });

    it('should not log error if passed error is an instance of UnresolvedRequestError', async () => {

      jest.spyOn(console, 'error').mockImplementation(() => {})

      const error = new UnresolvedRequestError()

      await mockProcessEnv({ NODE_ENV: 'production' }, () => {
        handleError({}, {}, error)
        expect(console.error).not.toHaveBeenCalled()
      })

      console.error.mockRestore()
    });

    it('should not log any errors if an application is not in the development mode', () => {

      jest.spyOn(console, 'error').mockImplementation(() => {})

      const error = new Error('test error')

      handleError({}, {}, error)

      expect(console.error).not.toHaveBeenCalled()

      console.error.mockRestore()
    });
  });
});
