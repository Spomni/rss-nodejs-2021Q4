function isMountPoint(value) {
  return typeof value === 'string'
    && /^\/[\w\d-./]*$/.test(value)
    && /(^\/$)|(^.+[^/]$)/.test(value)
    && !/\/\//.test(value)
}

module.exports = {
  isMountPoint
}
