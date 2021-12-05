const { chainPrototype } = require('./chain-prototype')
const { isMountPoint } = require('../contract/mount-point')

function doesStartWith(string, part) {
  const re = new RegExp(`^${part}`)
  return re.test(string)
}

class Request {

  constructor(parent, { mountPoint }) {

    if (!isMountPoint(mountPoint)) {
      throw new TypeError(`${mountPoint} is not valid mountPoint`)
    }

    if (parent.mountPoint && mountPoint === '/') {
      throw new Error('new mountPoint must not be equal to parent one')
    }

    chainPrototype(this, parent, 1)

    this._mountPoint = (parent.mountPoint && parent.mountPoint !== '/')
      ? parent.mountPoint + mountPoint
      : mountPoint

    if (!doesStartWith(parent.url, this._mountPoint)) {
      throw new Error('new mount point is not part of parent url')
    }

    this._path = this.url
      .replace(mountPoint, '')  // remove mountPoint
      .replace(/((\?)|(\/\?)).*$/, '') // remove query and trailing slash

    this._body = null
  }

  get mountPoint() {
    return this._mountPoint
  }

  get path() {
    return this._path
  }

  async readBody() {
    const body = await this._readBody()
    return body.toString()
  }

  async _readBody() {
    return new Promise((resolve, reject) => {

      if (this._body) {
        resolve(this._body)

      } else {

        this._body = Buffer.from([])

        this.on('error', (error) => {
          this._body = null
          reject(error)
        })

        this.on('end', () => resolve(this._body));

        this.on('data', (data) => {
          this._body = Buffer.concat([this._body, data])
        })
      }
    })
  }
}

function createRequest(parent, { mountPoint }) {
  return new Request(parent, { mountPoint })
}

module.exports = {
  Request,
  createRequest,
}