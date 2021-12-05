const { PassThrough } = require('stream')

class ParentRequest extends PassThrough {

  constructor(
    url = '/some/path/to',
    method = 'GET'
  ) {
    super()
    this.url = url
    this.method = method
  }
}

module.exports = {
  ParentRequest
}