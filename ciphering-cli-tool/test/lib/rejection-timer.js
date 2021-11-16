class RejectionTimer {

  constructor(reason, timeout) {
    Object.assign(this, {
      reason,
      timeout
    })
  }

  start() {
    return new Promise((resolve, reject) => {
      const descriptor = setTimeout(() => reject(this.reason), this.timeout)

      this.resolve = (value) => {
        clearTimeout(descriptor)
        resolve(value)
        return this
      }
    })
  }

  resolve(value) {
    return Promise.resolve(value)
  }
}

function getRejectionTimer(reason, timeout) {
  return new RejectionTimer(reason, timeout)
}

module.exports = {
  RejectionTimer,
}
