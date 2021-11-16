class RejectionTimer {

  constructor(reason, timeout) {
    this._reason = reason
    this._timeout = timeout
    this._promise = null
    this._descriptor = null
    this._resolve = null
  }
  
  get promise() {
    return this._promise
  }

  start() {
  
    if (!this._promise) {
      const { _reason, _timeout } = this

      this._promise = new Promise((resolve, reject) => {
        this._descriptor = setTimeout(() => reject(_reason), _timeout)
        this._resolve = resolve
      })
    }

    return this._promise
  }

  clear() {
  
    if (!this._promise) {
      this._promise = Promise._resolve()

    } else {
      clearTimeout(this._descriptor)
      this._resolve()
    }
    
    return this._promise
  }
}

function getRejectionTimer(reason, timeout) {
  return new RejectionTimer(reason, timeout)
}

module.exports = {
  RejectionTimer,
}
