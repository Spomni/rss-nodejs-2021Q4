class InvalidArgumentError extends Error {
  constructor(...args) {
    super('InvalidArgumentError: unexpected value ')
    if (args.length) this.message += args[0]
  }
}

module.exports = {
  InvalidArgumentError,
}