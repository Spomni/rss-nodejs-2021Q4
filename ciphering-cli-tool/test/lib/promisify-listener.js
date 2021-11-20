class ListenerController {

  /**
   *
   * @param {function} resolve
   * @param {function} reject
   * @param {EventEmmiter} emmiter
   * @param {any} event
   * @param {function} listener
   * @param {AbortSignal} signal
   */
  constructor(
    resolve,
    reject,
    emmiter,
    event,
    listener,
    signal,
  ) {

    this._resolve = resolve
    this._reject = reject
    this._emmiter = emmiter
    this._event = event

    signal.addEventListener('abort', () => this.abort())

    this._executor = this._createExecutor(listener)

    this._emmiter.on(this._event, this._executor)
  }

  abort(error) {
    this._emmiter.removeListener(this._event, this._executor)

    if (error) {
      this._reject(error)
    } else {
      this._resolve()
    }
  }

  _createExecutor(listener) {
    const executor = function listenerExecutor(...args) {
      try {
        listener(...args)
      } catch (error) {
        this.abort(error)
      }
    }
    return executor.bind(this)
  }
}

/**
 *
 * @param {EventEmmiter} emmiter
 * @param {any} event
 * @param {function} listener
 * @param {AbortSignal} signal
 * @returns
 */
 async function promisifyListener(...args) {
  return new Promise((resolve, reject) => {
    new ListenerController(resolve, reject, ...args)
  })
 }

/**
 *
 * @param {EventEmmiter} emmiter
 * @param {any} event
 * @param {function} listener
 * @param {AbortSignal} signal
 * @returns
 */
//  function promisifyListener(emmiter, event, listener, signal) {

//   const controller = {
//     isHandlerRunning: false,

//     clear: () => {throw new Error('Method is not implemented')},
//     resolve: () => {throw new Error('Method is not implemented')},
//     reject: () => {throw new Error('Method is not implemented')},
//     afterHandleEvent: () => {}
//   }

//   return new Promise((resolve, reject) => {

//     const handleEvent = function promisifiedListener(...args) {
//       controller.isHandlerRunning = true

//       try {
//         listener(...args)
//       } catch (error) {
//         controller.reject(error)
//       }

//       controller.isHandlerRunning = false
//       controller.afterHandleEvent()
//     }

//     controller.clear = () => {
//       emmiter.off(event, handleEvent)
//     }

//     controller.resolve = () => {
//       controller.clear()
//       resolve()
//     }

//     controller.reject = (error) => {
//       controller.clear()
//       reject(error)
//     }

//     signal.addEventListener('abort', () => {
//       if (!controller.isHandlerRunning) {
//         controller.resolve()
//       } else {
//         controller.afterHandleEvent = () => controller.resolve()
//       }
//     })

//     emmiter.on(event, handleEvent)
//   })
// }

module.exports = {
  promisifyListener,
}